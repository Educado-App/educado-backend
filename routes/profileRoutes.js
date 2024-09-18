const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { ProfileModel } = require('../models/Profile');
const { ProfileEducationModel } = require('../models/ProfileEducation');
const { ProfileExperienceModel } = require('../models/ProfileExperience');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const process = require('process');

const serviceUrl = process.env.TRANSCODE_SERVICE_URL;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define a route for updating user static profile data
router.put('/', async (req, res) => {
	const {
		userID,
		userBio,
		userLinkedInLink,
		userName,
		userEmail,
		userPhoto
	} = req.body;

	// Require userEmail & userID && email
	if (!userEmail || !userID || !userName) {
		return res.status(400).json({ error: errorCodes['E0202'] });
	}

	try {
		const user = await ProfileModel.findOne({ userID });
		// if user is not there then create new profile else update user profile
		if (!user) {
			const newProfile = new ProfileModel({
				userID,
				userPhoto: userPhoto,
				userBio,
				userLinkedInLink,
				userName,
				userEmail,
			});
			await newProfile.save();
			return res.status(200).json({ message: 'Profile created successfully', user: newProfile });
		}

		//Update profile
		const updatedData = {
			userID,
			userPhoto: userPhoto, // Use the existing photo if not provided in the request
			userBio,
			userLinkedInLink,
			userName,
			userEmail,
		};

		//if userid then update
		const updatedProfile = await ProfileModel.findOneAndUpdate(
			{ userID },
			updatedData,
			{ new: true }
		);

		// if there is not user display error
		if (!updatedProfile) {
			return res.status(404).json({ message: 'User profile not found' });
		}
		return res.status(200).json(updatedProfile);
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}
});

//Get static user profile data using userID
router.get('/:userID', async (req, res) => {
	const { userID } = req.params;
	try {
		const profile = await ProfileModel.findOne({ userID });
		if (profile) {
			res.status(200).json(profile);
		}
		else {
			res.status(404).json('user not found');
		}
	} catch (error) {
		res.status(400).send('internal server error');
	}
});

//Get user profile photo
router.get('/photo/:userID', async (req, res) => {
	const { userID } = req.params;

	if (!serviceUrl) {
		return res.status(500).json({ message: 'Service URL is missing' });
	}

	if (!userID) {
		return res.status(400).json({ error: errorCodes['E0202'] });
	}

	try {
		const user = await ProfileModel.findOne({ userID });

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (!user.userPhoto) {
			return res.status(200).send(null);
		}

		// Get the photo from the bucket api
		axios.get(serviceUrl + '/bucket/' + user.userPhoto).then((response) => {
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
router.put('/photo/:userID', upload.single('file'), async (req, res) => {
	const { userID } = req.params;

	const userPhoto = req.file;

	// Require userID
	if (!userID) {
		return res.status(400).json({ error: errorCodes['E0202'] });
	}

	if (!userPhoto) {
		return res.status(400).json({ message: 'No file uploaded' });
	}

	// Rename userPhoto to photo + timestamp
	const timestamp = new Date().getTime();
	const photoName = `${userID}-${timestamp}`;
	userPhoto.filename = photoName;

	try {
		const user = await ProfileModel.findOne({ userID });

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// If user has photo, then delete it from the bucket
		if (user.userPhoto) {
			try {
				await deleteImageFromBucket(user.userPhoto);
			} catch {
				console.log('Error deleting file from bucket');
			}
		}

		// Upload the new photo to the bucket
		try {
			await uploadImageToBucket(userPhoto);
		} catch {
			return res.status(500).json({ message: 'Error uploading file to bucket' });
		}

		// Update profle with new userPhoto
		const updatedProfile = await ProfileModel.findOneAndUpdate(
			{ userID},
			{ userPhoto: photoName },
			{ new: true }
		);

		return res.status(200).json(updatedProfile);
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
router.delete('/photo/:userID', async (req, res) => {
	const { userID } = req.params;

	// Require userID
	if (!userID) {
		return res.status(400).json({ error: errorCodes['E0202'] });
	}

	try {
		const user = await ProfileModel.findOne({ userID });

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// If user has photo, then delete it from the bucket
		if (user.userPhoto) {
			await deleteImageFromBucket(user.userPhoto);
		}

		const updatedProfile = await ProfileModel.findOneAndUpdate(
			{ userID },
			{ userPhoto: null },
			{ new: true }
		);

		return res.status(200).json(updatedProfile);
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

// Dynamic form Academic experience CRUD //
// Update second forms
router.put('/educations', async (req, res) => {
	const { userID, institution, course, startDate, endDate } = req.body;
	//Set fields by default in DB if empty
	const status = req.body.status === '' ? 'Basic' : req.body.status;
	//Require fields to be filled
	const educationLevel = req.body.educationLevel === '' ? 'Progressing' : req.body.educationLevel;
	if (!userID || !institution || !course || !startDate || !endDate) {
		return res.status(400).send('All fields are required');
	}
	try {
		const newEntry = await ProfileEducationModel({ userID, status, institution, course, educationLevel, startDate, endDate });
		newEntry.save();
		res.status(200).json(newEntry);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

//Get second forms
router.get('/educations/:userID', async (req, res) => {
	const { userID } = req.params;
	//check UserID
	if (!mongoose.Types.ObjectId(userID)) {
		return res.status(500).send('Invalid userID');
	}
	try {
		const data = await ProfileEducationModel.find({ userID: userID });
		if (data) {
			res.status(200).json(data);
		}
		else {
			res.status(404).send('Education Not found!');
		}

	} catch (error) {
		res.status(400).send('internal server error');
	}
});

//Delete dynamic entries
router.delete('/educations/:_id', async (req, res) => {
	const { _id } = req.params;
	try {
		if (!_id) {
			return res.status(400).send('_id is required');
		}

		const deleteEntry = await ProfileEducationModel.deleteOne({ _id: _id });
		if (deleteEntry) {
			res.status(200).send('Entry Deleted');
		}
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// Dynamic form professional experience CRUD //
// Update Third forms
router.put('/experiences', async (req, res) => {
	const { userID, company, jobTitle, checkBool, description, startDate, endDate } = req.body;
	//Require fields to be filled
	if (!userID || !company || !jobTitle || !description || !startDate || !endDate) {
		return res.status(400).send('All fields are required');
	}
	try {
		const newEntry = await ProfileExperienceModel({ userID, company, jobTitle, checkBool, description, startDate, endDate });
		newEntry.save();
		res.status(200).json(newEntry);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// Get professional experience formdata
router.get('/experiences/:userID', async (req, res) => {
	const { userID } = req.params;
	// Check ID
	if (!mongoose.Types.ObjectId(userID)) {
		return res.status(500).send('Invalid userID');
	}
	const data = await ProfileExperienceModel.find({ userID: userID });
	res.status(200).json(data);
});

//Delete dynamic entries
router.delete('/experiences/:_id', async (req, res) => {
	const { _id } = req.params;
	try {

		if (!_id) {
			return res.status(400).send('_id is required');
		}
		const deleteEntry = await ProfileExperienceModel.deleteOne({ _id: _id });
		if (deleteEntry) {
			res.status(200).send('Entry Deleted');
		}

	} catch (err) {
		res.status(500).send(err.message);
	}
});
module.exports = router;