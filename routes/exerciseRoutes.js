const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
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

// Get all exercises
router.get('/', async (req, res) => {
	const list = await ExerciseModel.find();
	res.send(list);
});

module.exports = router;