const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Models
const { CourseModel } = require("../models/Courses");
const { SectionModel } = require("../models/Sections");
const { ComponentModel } = require("../models/Components");
const { User } = require("../models/User");
const {
	ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");
const { UserModel } = require("../models/User");
const { IdentityStore } = require("aws-sdk");



/*** COURSE, SECTIONS AND EXERCISE ROUTES ***/


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

		console.log(error);
		return res.status(500).json({ 'error': errorCodes['E0003'] });
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
		console.log(error);
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
		console.log(error);
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});

/*
// Get all excercies from a section *** commented out since we do not use it per 10/10
router.get("/:courseId/sections/:sectionId/exercises", async (req, res) => {

	try {
	const { courseId, sectionId } = req.params; 

	// find a specific section within the given course by both IDs
	const exercises = await ExerciseModel.find({ parentSection: sectionId });
	res.send(exercises);

	} catch (error) {
	console.error(error);
	res.status(500).json({ message: 'Server error' });
	}

});
*/

/*** SUBSCRIPTION ROUTES ***/

// Subscribe to course 
router.post('/:id/subscribe', async (req, res) => {

	try {
		const { id } = req.params;
		const { user_id } = req.body;

		const user = await User.findById(user_id);

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
		(await User.findOneAndUpdate(
			{ _id: user_id },
			{ $push: { subscriptions: id } }))
			.save;

		res.send(user);

	} catch (error) {
		console.log(error);
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});

// Unsubscribe to course
router.post('/:id/unsubscribe', async (req, res) => {

	try {
		const { id } = req.params;
		const { user_id } = req.body;

		const user = await User.findById(user_id);
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
		(await User.findOneAndUpdate(
			{ _id: user_id },
			{ $pull: { subscriptions: id } }))
			.save;

		res.send(user)

	} catch (error) {
		console.log(error);
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});


module.exports = router;
