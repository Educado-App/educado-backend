const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { markAsCompleted } = require('../helpers/completing');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { addIncompleteCourse } = require('../helpers/completing');
const { StudentModel } = require('../models/Students');
const { CourseModel } = require('../models/Courses');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const process = require('process');
const { getLeaderboard } = require('../helpers/leaderboard');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const serviceUrl = process.env.TRANSCODER_SERVICE_URL;

router.get('/all', async (req, res) => {
	try {
	  const students = await StudentModel.find({});
	  return res.status(200).json(students);
	} catch (error) {
	  return res.status(500).json({ error: errorCodes['E0003'] });
	}
  });

router.get('/:id/info', async (req, res) => {
	try {
		const id = mongoose.Types.ObjectId(req.params.id);

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).send({ error: errorCodes['E0014'] });
		}

		const student = await StudentModel.findOne({ baseUser: id });

		if (!student) {
			return res.status(404).send({ error: errorCodes['E0004'] });
		}

		return res.status(200).send(student);
	} catch (error) {
		return res.status(500).send({ error: errorCodes['E0003'] });
	}
});

/** Profile Photos **/
//Get user profile photo
router.get('/:id/photo', async (req, res) => {
	const id = mongoose.Types.ObjectId(req.params.id);

	if (!serviceUrl) {
		return res.status(500).json({ message: 'Service URL is missing' });
	}

	if (!id) {
		return res.status(400).json({ error: errorCodes['E0202'] });
	}

	try {
		const student = await StudentModel.findOne({ baseUser: id });

		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		if (!student.profilePhoto) {
			return res.status(200).send(null);
		}

		// Get the photo from the bucket api
		axios.get(serviceUrl + '/bucket/' + student.profilePhoto).then((response) => {
			res.send(response.data);
		}).catch((error) => {
			if (error.response && error.response.data) {
				// Forward the status code from the Axios error if available
				res.status(error.response.status || 500).send(error.response.data);
			} else {
				console.log(error);
				// Handle cases where the error does not have a response part (like network errors)
				res.status(500).send({ message: 'An error occurred during fetching.' });
			}
		});
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}
});

//Update user profile photo
router.put('/:id/photo', upload.single('file'), async (req, res) => {
	const id = mongoose.Types.ObjectId(req.params.id);

	const profilePhoto = req.file;

	if (!(profilePhoto.mimetype == 'image/jpeg' || profilePhoto.mimetype == 'image/png')) {
		return res.status(400).json({ message: 'Invalid file type' });
	}

	// Require userID
	if (!id) {
		return res.status(400).json({ error: errorCodes['E0202'] });
	}

	if (!profilePhoto) {
		return res.status(400).json({ message: 'No file uploaded' });
	}

	// Rename userPhoto to photo + timestamp
	const timestamp = new Date().getTime();
	const fileExtension = req.file.originalname.split('.').pop();
	const photoName = `${id}-${timestamp}.${fileExtension}`;
	profilePhoto.filename = photoName;

	try {
		const student = await StudentModel.findOne({ baseUser: id });

		if (!student) {
			return res.status(404).json({ message: 'User not found' });
		}

		// If user has photo, then delete it from the bucket
		if (student.profilePhoto) {
			try {
				await deleteImageFromBucket(student.profilePhoto);
			} catch {
				console.log('Error deleting file from bucket');
			}
		}

		// Upload the new photo to the bucket
		try {
			await uploadImageToBucket(profilePhoto);
		} catch {
			return res.status(500).json({ message: 'Error uploading file to bucket' });
		}

		// Update profle with new userPhoto
		const updatedStudent = await StudentModel.findOneAndUpdate(
			{ baseUser: id },
			{ profilePhoto: photoName },
			{ new: true }
		);

		return res.status(200).json(updatedStudent);
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}
});

const uploadImageToBucket = async (file) => {
	if (!serviceUrl) {
		throw new Error('Service URL is missing');
	}

	const form = new FormData();

	// Add file and filename to form
	form.append('file', file.buffer, {
		filename: file.filename,
		contentType: file.mimetype
	});
	form.append('fileName', file.filename);

	// Forward to service api
	await axios.post(serviceUrl + '/bucket/', form, { headers: form.getHeaders() })
		.then(response => {
			return response.data;
		}).catch(error => {
			console.log(error.response);
			throw new Error('An error occurred during upload.');
		});
};

//Delete user profile photo
router.delete('/:id/photo', async (req, res) => {
	const id = mongoose.Types.ObjectId(req.params.id);

	// Require userID
	if (!id) {
		return res.status(400).json({ error: errorCodes['E0202'] });
	}

	try {
		const student = await StudentModel.findOne({ baseUser: id });

		if (!student) {
			return res.status(404).json({ message: 'User not found' });
		}

		// If user has photo, then delete it from the bucket
		if (student.profilePhoto) {
			await deleteImageFromBucket(student.profilePhoto);
		}

		const updatedStudent = await StudentModel.findOneAndUpdate(
			{ baseUser: id },
			{ userPhoto: null },
			{ new: true }
		);

		return res.status(200).json(updatedStudent);
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}
});

const deleteImageFromBucket = async (filename) => {
	//Forward to service api
	await axios.delete(serviceUrl + '/bucket/' + filename).then((response) => {
		return response.data;
	});
};

/** SUBSCRIPTIONS **/

// Get users subscriptions
router.get('/:id/subscriptions', async (req, res) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).send({ error: errorCodes['E0014'] });
		}
		const userId = mongoose.Types.ObjectId(req.params.id);

		// Find the user by _id and select the 'subscriptions' field
		const user = await StudentModel.findOne({ baseUser: userId }).select('subscriptions');

		//checks if user exist
		if (!user) {
			// Handle "user not found" error response here
			return res.status(400).json({ 'error': errorCodes['E0004'] });
		}

		const subscribedCourses = user.subscriptions;

		// Find courses based on the subscribed course IDs
		const courseList = await CourseModel.find({ '_id': { $in: subscribedCourses } });

		res.send(courseList);

	} catch (error) {
		// If the server could not be reached, return an error message
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});

// Checks if student is subscribed to a specific course
router.get('/subscriptions', async (req, res) => {
	try {
		const { user_id, course_id } = req.query;

		if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
			return res.status(400).send({ error: errorCodes['E0014'] });
		}

		// Check if the course_id exists in the user's subscriptions array
		const user = await StudentModel.findOne({ baseUser: user_id });

		//checks if user exist
		if (!user) {
			// Handle "user not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0004'] });
		}

		const course = await CourseModel.findById(course_id);

		// check if courses exist
		if (!course) {
			// Handle "course not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0006'] });
		}

		if (user.subscriptions.includes(course_id)) {
			// User is subscribed to the course
			res.send('true');
		} else {
			// User is not subscribed to the course
			res.send('false');
		}

	} catch (error) {
		// If the server could not be reached, return an error message
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});

router.patch('/:id/courses/:courseId/enroll', requireLogin, async (req, res) => {
	try {
		const { id, courseId } = req.params;

		const course = await CourseModel.findById(courseId);

		if (!course) {
			return res.status(404).json({ error: errorCodes['E0006'] });
		}

		const student = await StudentModel.findOne({ baseUser: id });

		if (!student) {
			return res.status(404).json({ error: errorCodes['E0004'] });
		}

		if (student.courses.find(course => course.courseId.equals(id))) {
			return res.status(400).json({ error: errorCodes['E0016'] });
		}

		const obj = await addIncompleteCourse(course);
		student.courses.push(obj);

		await StudentModel.findOneAndUpdate(
			{ baseUser: id },
			{
				$set: {
					courses: student.courses
				}
			}
		);

		return res.status(200).send(student);
	} catch (error) {
		// If the server could not be reached, return an error message
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});


// Mark courses, sections, and components as completed for a user
router.patch('/:id/complete', requireLogin, async (req, res) => {
	try {
		const { id } = req.params;
		let { comp, isComplete, points } = req.body;

		let student = await StudentModel.findOne({ baseUser: id });

		if (!student) {
			return res.status(404).json({ error: errorCodes['E0004'] });
		}

		const updatedStudent = await markAsCompleted(student, comp, points, isComplete);

		res.status(200).send(updatedStudent);
	} catch (error) {
		// If the server could not be reached, return an error message
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});

// Update the current extra points for a student like daily streaks
router.put('/:id/extraPoints', requireLogin, async (req, res) => {
	try {
		const { id } = req.params;
		const { extraPoints } = req.body;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: errorCodes['E0014'] });
		}

		if (isNaN(extraPoints)) {
			return res.status(400).json({ error: errorCodes['E0804'] });
		}

		const student = await StudentModel.findOneAndUpdate(
			{ baseUser: id },
			{
				$inc: {
					currentExtraPoints: extraPoints
				}
			}
		);

		if (!student) {
			return res.status(404).json({ error: errorCodes['E0004'] });
		}

		res.status(200).json(student);
	} catch (error) {
		res.status(500).json({ error: errorCodes['E0003'] });
	}
});

/* NOT USED  */
// Get the 100 students with the highest points, input is the time interval (day, week, month, all)
router.get('/leaderboard', requireLogin, async (req, res) => {
  try {
    const { timeInterval } = req.query; // Get time interval from query parameters
    const userId = req.user._id; // Get the current user's ID from the request

    if (!timeInterval || !['day', 'week', 'month', 'all', 'everyMonth'].includes(timeInterval)) {
      return res.status(400).json({ error: errorCodes['E0015'] });
    }

    const { leaderboard, currentUserRank } = await getLeaderboard(timeInterval, userId);
    res.status(200).json({ leaderboard, currentUserRank });
  } catch (error) {
    res.status(500).json({ error: errorCodes['E0003'], message: error.message });
  }
});

module.exports = router;