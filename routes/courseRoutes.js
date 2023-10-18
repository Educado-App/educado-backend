const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const adminOnly = require("../middlewares/adminOnly");

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

// Get all courses for one user
router.get('/creator/:id', requireLogin, async (req, res) => {
  const id = req.params.id; // Get user id from request
  const courses = await CourseModel.find({creator: id}); // Find courses for a specific user
	
  res.send(courses); // Send response
});

//Get all courses
router.get('/', adminOnly, async (req, res) => {

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
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}

});


module.exports = router;
