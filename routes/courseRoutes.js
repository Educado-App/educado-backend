const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const adminOnly = require("../middlewares/adminOnly");

// Models
const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { ComponentModel } = require('../models/Components');
const { ExerciseModel } = require('../models/Exercises');
const { UserModel } = require('../models/Users');
const {
	ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");
const { IdentityStore } = require("aws-sdk");


/*** COURSE, SECTIONS AND EXERCISE ROUTES ***/

// Get all courses 
router.get('/courses', adminOnly, async (req, res) => {
	const result = await CourseModel.find({});
	res.send(result);
});

// Get all courses for one user
router.get('/courses/creator/:id', requireLogin, async (req, res) => {
  const id = req.params.id; // Get user id from request
  const courses = await CourseModel.find({creator: id}); // Find courses for a specific user
	
  res.send(courses); // Send response
});

//Get all courses
router.get('', async (req, res) => {

	try {
		// find all courses in the database
		const courses = await CourseModel.find();

		// check if sections exist
		if (courses.length === 0) {
			// Handle "courses not found" error response here
			return res.status(404).json({ 'error': errorCodes['E0005'] });
		}

		res.send(courses);


	} catch (error) {
		// If the server could not be reached, return an error message
		console.log(error);
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});


// Get specific course
router.get('/:id', async (req, res) => {

	try {
		const { id } = req.params;

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

// Get all sections
router.post('/course/getallsections', requireLogin, async (req, res) => {
	const { sections } = req.body;
	let list = [];
	for (let i = 0; i < sections.length; i++) {
		const temp = await SectionModel.findOne({ _id: sections[i] });
		list.push(temp);
	}
	res.send(list);
});

// Get all sections for course
router.get('/section/getall/:course_id', async (req, res) => {
	const { course_id } = req.params;
	const course = await CourseModel.findById(course_id);
	const list = await SectionModel.find({ _id: course.sections });
	res.send(list);
});

// Update section title
router.post('/course/update/sectiontitle', async (req, res) => {
	// ...
	// get new value & section ID
	const { value, sectionId } = req.body;

	// find object in database and update title to new value
	(await SectionModel.findOneAndUpdate({ _id: sectionId }, { title: value }))
		.save;

	// Send response
	res.send('Completed');
});

// Update course description
router.post('/section/update/title', async (req, res) => {
	const { text, section_id } = req.body;

	// find object in database and update title to new value
	(await SectionModel.findOneAndUpdate({ _id: section_id }, { title: text }))
		.save;
	section = await SectionModel.findById(section_id);

	// Send response
	res.send(section);
});

// Update section description
router.post('/section/update/description', async (req, res) => {
	const { text, section_id } = req.body;

	// find object in database and update title to new value
	(
		await SectionModel.findOneAndUpdate(
			{ _id: section_id },
			{ description: text }
		)
	).save;
	section = await SectionModel.findById(section_id);

	// Send response
	res.send(section);
});

// Update sections order
router.post('/course/update/sectionsorder', async (req, res) => {
	// Get sections from request
	const { sections, course_id } = req.body;
	// REPORT NOTE: Måske lav performance test, for om det giver bedst mening at wipe array og overskrive, eller tjekke 1 efter 1 om updates
	// Overwrite existing array
	(
		await CourseModel.findOneAndUpdate(
			{ _id: course_id },
			{ sections: sections }
		)
	).save;

	course = await CourseModel.findById(course_id);

	// Send response
	res.send(course);
});

// Delete component for user
router.post('/section/delete', requireLogin, async (req, res) => {
	const { section_id, course_id } = req.body;

	const course = await CourseModel.findById(course_id).catch((err) => {
		console.log(err);
	});

	let sectionIds = course.sections;

	let index = sectionIds.indexOf(section_id);
	if (index !== -1) {
		sectionIds.splice(index, 1);
	}

})


// Get all sections from course
router.get('/:id/sections', async (req, res) => {

	try {
		const { id } = req.params;

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

/*** SUBSCRIPTION ROUTES ***/

// Subscribe to course 
router.post('/:id/subscribe', async (req, res) => {

	try {
		const { id } = req.params;
		const { user_id } = req.body;

		const user = await UserModel.findById(user_id);

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

		// find user based on id, and add the course's id to the user's subscriptions field
		(await UserModel.findOneAndUpdate(
			{ _id: user_id },
			{ $push: { subscriptions: id } }))
			.save;

		res.send(user);

	} catch (error) {
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});

// Unsubscribe to course
router.post('/:id/unsubscribe', async (req, res) => {

	try {
		const { id } = req.params;
		const { user_id } = req.body;

		const user = await UserModel.findById(user_id);
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

		// find user based on id, and remove the course's id from the user's subscriptions field
		(await UserModel.findOneAndUpdate(
			{ _id: user_id },
			{ $pull: { subscriptions: id } }))
			.save;

		res.send(user)

	} catch (error) {
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});

// Get all exercises
router.get('/exercise/getall', async (req, res) => {
	const list = await ExerciseModel.find();
	res.send(list);
});

// Get all exercises for section
router.get('/exercise/getall/:section_id', async (req, res) => {
	const { section_id } = req.params;
	const section = await SectionModel.findById(section_id);
	const list = await ExerciseModel.find({ _id: section.exercises });
	res.send(list);
});

module.exports = router;
