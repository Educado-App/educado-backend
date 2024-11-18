const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');

// TODO: Update subscriber count to check actual value in DB

// Models
const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { FeedbackOptionsModel } = require('../models/FeedbackOptions');
const { ExerciseModel } = require('../models/Exercises');
const { LectureModel } = require('../models/Lectures');
const { ContentCreatorModel } = require('../models/ContentCreators');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { StudentModel } = require('../models/Students');

// This one is deprecated, but it is used on mobile so we can't delete it yet
const { OldLectureModel } = require('../models/Lecture');

const { createCourseObject, createSections } = require('../helpers/courseHelpers');

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


const topFeedbackOptionForCourses = async (courses) => {
	// Fetch all feedback options in a single query
	const feedbackOptions = await FeedbackOptionsModel.find().lean();

	// Create a map of feedback options by ID for quick lookup
	const feedbackOptionsMap = feedbackOptions.reduce((map, option) => {
		map[option._id] = option;
		return map;
	}, {});

	// Process each course
	courses.forEach(course => {
		if (course.feedbackOptions && course.feedbackOptions.length > 0) {
			// Sort feedback options by count in descending order and take the top two
			const topFeedbackOptions = course.feedbackOptions
				.sort((a, b) => b.count - a.count)
				.slice(0, 2);

			// Get the names of the top feedback options
			const feedbackOptionNames = topFeedbackOptions.map(option => {
				const feedbackOption = feedbackOptionsMap[option._id];
				if (!feedbackOption) {
					console.log(`Feedback option with ID ${option._id} not found`);
					return null;
				}
				return feedbackOption.name;
			});

			// Filter out null values and attach the names to the course object
			course.topFeedbackOptions = feedbackOptionNames.filter(name => name !== null);
		} else {
			course.topFeedbackOptions = [];
		}
	});

	return courses;
};

// Get all courses
router.get('/', async (req, res) => {
	try {
		// Find all courses in the database and convert to plain objects
		const courses = await CourseModel.find().lean();

		// Get top feedback options for each course
		const coursesWithFeedback = await topFeedbackOptionForCourses(courses);
		res.json(coursesWithFeedback);
	} catch (error) {
		console.error('Error fetching courses:', error);
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
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
		sections: [],
		status: status,
		estimatedHours: estimatedHours,
		rating: 0,
	});

	try {
		const result = await course.save({ new: true })
			//As id is generated at save, we need to .then() and then save
			.then(savedCourse => {
				const generatedId = savedCourse._id;
				savedCourse.coverImg = generatedId + '_c';

				return savedCourse.save();
			});
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
			dateUpdated: Date.now(),
			coverImg: course.coverImg
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
			return res.status(400).send({ error: errorCodes['E0014'], msg: 'Invalid courseID' + id }); // If id is not valid, return error
		}

		// Validate section IDs
		for (const sectionId of sections) {
			if (!mongoose.Types.ObjectId.isValid(sectionId)) {
				return res.status(400).send({ error: errorCodes['E0014'], msg: 'invalid sectionID' + sectionId }); // If section id is not valid, return error
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


// Update course published status 
// Status is enum: "published", "draft", "hidden"
router.patch('/:id/updateStatus', async (req, res) => {
	const { status } = req.body;
	const { id } = req.params;

	// find object in database and update title to new value
	(
		await CourseModel.findOneAndUpdate(
			{ _id: id },
			{ status: status }
		)
	).save;
	const course = await CourseModel.findById(id);

	// Send response
	res.send(course);
});



//When creating new course from scratch
router.put('/create/new', async(req, res) => {
	try{
	// title, category, difficulty, description, coverImg	
		const { courseInfo } = req.body.courseInfo;
		const { sections } = req.body.sections ? req.body.sections : [];

		const courseObject = createCourseObject(courseInfo);

		const sectionsArrayObject = createSections(sections);

		courseObject.sections = sectionsArrayObject;
		
		const course = await CourseModel.insertOne(courseObject);
		
		if(course.acknowledged) {
			res.send(200);
		}
		res.send(500);
	} catch {
		res.send(404);
	}
});

router.get('/create/new', async(req, res) => {

	console.log('test');
	res.send(200);
});



module.exports = router;

/*
//course
title
category
difficulty
description
coverImg

status

sections[]

creator
dateCreated
dateUpdated
_id

//section
title
description

components[] // lecture, exercise

dateCreated
dateUpdated
_id
parentCourse

//lecture
title
description

contentType
content


dateCreated
dateUpdated
_id
parentSection

//exercise
title
question

answers[] -- _id, text, correct : bool, feedback, dateUpdated

_id
parentSection
dateCreated
dateUpdated

What is a course?
	- title, category, difficulty, description, coverImg
*/