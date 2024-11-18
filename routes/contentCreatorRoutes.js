const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');

// Models
const { CoursesModel } = require('../models/Courses');


router.get('/test', async (req, res) => {
	try {
		res.send('Test successful');
	} catch (e) {
		return res.status(400).json({ 'error': e.message });
	}
});

// Given an ID, returns all certicates that users have earned on all courses 
//TODO: Implement



module.exports = router;