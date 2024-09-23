const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');

// TODO: Update subscriber count to check actual value in DB

// Models
const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { ExerciseModel } = require('../models/Exercises');
const { LectureModel } = require('../models/Lectures');
const { ContentCreatorModel } = require('../models/ContentCreators');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { StudentModel } = require('../models/Students');

// This one is deprecated, but it is used on mobile so we can't delete it yet
const { OldLectureModel } = require('../models/Lecture');

const COMP_TYPES = {
	LECTURE: 'lecture',
	EXERCISE: 'exercise',
};

const LectureType = {
	VIDEO: 'video',
	TEXT: 'text',
};

/*** COURSE, SECTIONS AND EXERCISE ROUTES ***/

// Get all courses for one user
router.get('/creator/:id', requireLogin, async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).send({ error: errorCodes['E0014'] }); // If id is not valid, return error
	}

	const creator = await ContentCreatorModel.findOne({ baseUser: mongoose.Types.ObjectId(req.params.id) }); // Get user id from request

	if (!creator) {
		return res.status(400).send({ error: errorCodes['E0004'] }); // If user does not exist, return error
	}

	const courses = await CourseModel.find({ creator: creator._id }); // Find courses for a specific user

	return res.status(200).send(courses); // Send response

});

//Get all courses
router.get('/', async (req, res) => {

	try {
		// find all courses in the database
		const courses = await CourseModel.find();
		res.send(courses);
	} catch (error) {
		// If the server could not be reached, return an error message
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});

// Get specific course
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).send({ error: errorCodes['E0014'] }); // If id is not valid, return error
		}

		// find a course based on it's id
		const course = await CourseModel.findById(id);

		// check if courses exist
		if (!course) {
			// Handle "course not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0006'] });
		}
		res.send(course);
	} catch (error) {
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});

// Get all sections from course
router.get('/:id/sections', async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).send({ error: errorCodes['E0014'] }); // If id is not valid, return error
		}

		// find a course based on it's id
		const course = await CourseModel.findById(id);

		// check if courses exist
		if (!course) {
			// Handle "course not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0006'] });
		}

		const sectionsInCourse = course.sections;

		// check if course contains sections
		if (sectionsInCourse.length === 0) {
			// Handle "course does not contain sections" error response here
			return res.status(404).json({ 'error': errorCodes['E0009'] });
		}

		// check if the sections exists
		const sectionsList = await SectionModel.find({ '_id': { $in: sectionsInCourse } });
		if (sectionsList.length === 0) {
			// Handle "course does not contain sections" error response here
			return res.status(404).json({ 'error': errorCodes['E0007'] });
		}

		res.send(sectionsList);

	} catch (error) {
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});

// Get a specififc section 
router.get('/:courseId/sections/:sectionId', async (req, res) => {

	try {
		const { courseId, sectionId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
			return res.status(400).send({ error: errorCodes['E0014'] }); // If id is not valid, return error
		}

		const course = await CourseModel.findById(courseId);
		// check if courses exist
		if (!course) {
			// Handle "course not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0006'] });
		}
		// find a specific section within the given course by both IDs
		const section = await SectionModel.findOne({ parentCourse: courseId, _id: sectionId });

		// check if section exist
		if (!section) {
			// Handle "section not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0008'] });
		}

		res.send(section);

	} catch (error) {
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});


/**
 * This route is deprecated, but it might be used on mobile so we can't delete it yet
 * instead of the old lecture model, we should use the new one
 * Which instead of having a video/image field, it has a contentType and content field
 */
// Get all comps from a section
router.get('/sections/:id/components', async (req, res) => {
	const { id } = req.params;

	const section = await SectionModel.findById(id);
	if (!section) {
		return res.status(404).json({ error: errorCodes['E0007'] });
	}

	let obj = {
		component: null,
		type: null,
		lectureType: null,
	};

	const components = [];

	for (let comp of section.components) {
		if (comp.compType === COMP_TYPES.LECTURE) {
			const lecture = await OldLectureModel.findById(comp.compId);
			if (!lecture) {
				return res.status(404).json({ error: errorCodes['E0007'] });
			}
			obj = {
				component: lecture,
				type: COMP_TYPES.LECTURE,
				lectureType: lecture.video ? LectureType.VIDEO : LectureType.TEXT,
			};
		} else {
			const exercise = await ExerciseModel.findById(comp.compId);
			if (!exercise) {
				return res.status(404).json({ error: errorCodes['E0007'] });
			}
			obj = {
				component: exercise,
				type: COMP_TYPES.EXERCISE,
			};
		}
		components.push(obj);
	}

	res.status(200).send(components);
});

/*** SUBSCRIPTION ROUTES ***/

// Subscribe to course 
router.post('/:id/subscribe', async (req, res) => {
	try {
		const { id } = req.params;
		const { user_id } = req.body;

		if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).send({ error: errorCodes['E0014'] }); // If id is not valid, return error
		}

		const studentId = mongoose.Types.ObjectId(user_id);
		const user = await StudentModel.findOne({ baseUser: studentId });

		//checks if user exist
		if (!user) {
			// Handle "user not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0004'] });
		}

		const course = await CourseModel.findById(id);
		// check if courses exist
		if (!course) {
			// Handle "course not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0006'] });
		}

		if (user.subscriptions.includes(id)) {
			return res.status(400).json({ 'error': errorCodes['E0605'] }); //TODO: change error code
		}

		course.numOfSubscriptions++;
		user.subscriptions.push(id);
    
		// find user based on id, and add the course's id to the user's subscriptions field
		await StudentModel.findOneAndUpdate(
			{ baseUser: studentId },
			{
				$set: {
					subscriptions: user.subscriptions,
				}
			}
		);

		await CourseModel.findOneAndUpdate(
			{ _id: course._id },
			{ numOfSubscriptions: course.numOfSubscriptions }
		);

		return res.status(200).send(user);

	} catch (error) {
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});

// Unsubscribe to course
router.post('/:id/unsubscribe', async (req, res) => {
	try {
		const { id } = req.params;
		const { user_id } = req.body;

		if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).send({ error: errorCodes['E0014'] }); // If id is not valid, return error
		}

		const studentId = mongoose.Types.ObjectId(user_id);
		const user = await StudentModel.findOne({ baseUser: studentId });
		//checks if user exist
		if (!user) {
			// Handle "user not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0004'] });
		}

		const course = await CourseModel.findById(id);
		// check if courses exist
		if (!course) {
			// Handle "course not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0006'] });
		}

		if (!user.subscriptions.includes(id)) {
			return res.status(400).json({ 'error': errorCodes['E0606'] }); //TODO: change error code
		}

		course.numOfSubscriptions--;
		// Remove course id from user's subscriptions
		user.subscriptions.indexOf(id) > -1 && user.subscriptions.splice(user.subscriptions.indexOf(id), 1);

		// find user based on id, and remove the course's id from the user's subscriptions field
		await StudentModel.findOneAndUpdate(
			{ baseUser: studentId },
			{ subscriptions: user.subscriptions });

		await CourseModel.findOneAndUpdate(
			{ _id: course._id },
			{ numOfSubscriptions: course.numOfSubscriptions }
		);

		return res.status(200).send(user);

	} catch (error) {
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});

// Get all exercises for section
router.get('/:section_id/exercises', async (req, res) => {
	const { section_id } = req.params;
	const section = await SectionModel.findById(section_id);
	const list = await ExerciseModel.find({ _id: section.exercises });
	res.send(list);
});

/*** CREATE COURSE ROUTES ***/

//Create course route
router.put('/', async (req, res) => {
	const { title, category, difficulty, description, creator, status, estimatedHours } = req.body;

	const creatorProfile = await ContentCreatorModel.findOne({ baseUser: creator });

	if (!creatorProfile) {
		return res.status(400).send({ error: errorCodes['E0004'] }); // If user does not exist, return error
	}

	const id = creatorProfile._id;

	const course = new CourseModel({
		title: title,
		category: category,
		difficulty: difficulty,
		description: description,
		//temporarily commented out as login has not been fully implemented yet
		//_user: req.user.id,
		creator: id,
		published: false,
		coverImg: '',
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
		sections: [],
		status: status,
		estimatedHours: estimatedHours,
		rating: 0,
	});

	try {
		const result = await course.save({ new: true });
		return res.status(201).send(result);
	} catch (err) {
		return res.status(400).send(err);
	}
});

// Update Course
router.patch('/:id', /*requireLogin,*/ async (req, res) => {
	const course = req.body;
	const { id } = req.params;

	const dbCourse = await CourseModel.findByIdAndUpdate(
		id,
		{
			title: course.title,
			description: course.description,
			category: course.category,
			difficulty: course.difficulty,
			estimatedHours: course.estimatedHours,
			published: course.published,
			status: course.status,
			dateUpdated: Date.now()
		},
		function (err) {
			if (err) {
				return res.status(400).send(err);
			}
		}
	);
	return res.status(200).send(dbCourse);
});
// Update section order of a course 
router.patch('/:id/sections', async (req, res) => {
	try {
		const { id } = req.params;
		const { sections } = req.body;

		// Validate course ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).send({ error: errorCodes['E0014'], msg: "Invalid courseID" + id }); // If id is not valid, return error
		}

		// Validate section IDs
		for (const sectionId of sections) {
			if (!mongoose.Types.ObjectId.isValid(sectionId)) {
				return res.status(400).send({ error: errorCodes['E0014'], msg: "invalid sectionID" + sectionId }); // If section id is not valid, return error
			}
		}

		// Find the course
		const course = await CourseModel.findById(id);

		// Check if course exists
		if (!course) {
			return res.status(404).json({ error: errorCodes['E0006'] }); // If course not found, return error
		}

		// Update the sections order
		course.sections = sections;

		// Save the updated course
		await course.save();

		// Send response
		return res.status(200).send(course);

	} catch (error) {
		return res.status(500).json({ error: errorCodes['E0003'] });
	}
});



/**
 * Delete course by id
 * Delete all sections in course
 * Delete all lectures and excercises in every section in course
 * 
 * @param {string} id - course id
 * @returns {string} - Just sends a message to confirm that the deletion is complete
 */
router.delete('/:id'/*, requireLogin*/, async (req, res) => {
	const { id } = req.params;

	// Get the course object
	const course = await CourseModel.findById(id).catch((err) => res.status(204).send(err));


	// Get the section array from the course object
	const sectionIds = course.sections;

	// Loop through all sections in course
	sectionIds.map(async (section_id) => {

		// Get the section object from the id in sectionIds array
		let section = await SectionModel.findById(section_id);

		// Delete all lectures and excercises in the section
		await LectureModel.deleteMany({ parentSection: section._id });
		await ExerciseModel.deleteMany({ parentSection: section._id });

		// Delete the section
		await SectionModel.findByIdAndDelete(section_id);
	});

	// Delete the course
	await CourseModel.findByIdAndDelete(id).catch((err) => res.status(204).send(err));


	// Send response
	return res.status(200).send('Course Deleted');

});


// Update course published state
router.patch('/published', async (req, res) => {
	const { published, course_id } = req.body;

	// find object in database and update title to new value
	(
		await CourseModel.findOneAndUpdate(
			{ _id: course_id },
			{ published: published }
		)
	).save;
	const course = await CourseModel.findById(course_id);

	// Send response
	res.send(course);
});


module.exports = router;
