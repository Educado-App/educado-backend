const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const adminOnly = require("../middlewares/adminOnly");

// TODO: Update subscriber count to check actual value in DB

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
const mongoose = require('mongoose');


/*** COURSE, SECTIONS AND EXERCISE ROUTES ***/

// Get all courses for one user
router.get('/creator/:id', requireLogin, async (req, res) => {
  const id = req.params.id; // Get user id from request
  const courses = await CourseModel.find({ creator: id }); // Find courses for a specific user



  res.send(courses); // Send response
});

//Get all courses
router.get('/', async (req, res) => {

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

    if (user.subscriptions.includes(id)) {
      return res.status(400).json({ 'error': errorCodes['E0605'] }); //TODO: change error code
    }

    course.numOfSubscriptions++;
    user.subscriptions.push(id);


    // find user based on id, and add the course's id to the user's subscriptions field
    await UserModel.findOneAndUpdate(
      { _id: user_id },
      { subscriptions: user.subscriptions });

    await CourseModel.findOneAndUpdate(
      { _id: course._id },
      { numOfSubscriptions: course.numOfSubscriptions }
    );


    res.status(200).send(user);

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

    if(!user.subscriptions.includes(id)){
      return res.status(400).json({ 'error': errorCodes['E0606'] }); //TODO: change error code
    }

    course.numOfSubscriptions--;
    // Remove course id from user's subscriptions
    user.subscriptions.indexOf(id) > -1 && user.subscriptions.splice(user.subscriptions.indexOf(id), 1);

    // find user based on id, and remove the course's id from the user's subscriptions field
    await UserModel.findOneAndUpdate(
      { _id: user_id },
      { subscriptions: user.subscriptions })

    await CourseModel.findOneAndUpdate(
      { _id: course._id },
      { numOfSubscriptions: course.numOfSubscriptions }
    );

    res.send(user)

  } catch (error) {
    console.log(error);
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
router.put("/", async (req, res) => {
  const { title, category, difficulty, description, estimatedHours } = req.body;
	console.dir(req.body);
  const course = new CourseModel({
    title: title,
    category: category,
    difficulty: difficulty,
    description: description,
    //temporarily commented out as login has not been fully implemented yet
    //_user: req.user.id,
    published: false,
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    sections: [],
    estimatedHours: estimatedHours,
	rating: 0,
  });

  try {
    await course.save();
	res.status(201).send(course);
  } catch (err) {
    res.status(422).send(err);
  }
});

// Update Course
router.patch("/:id", /*requireLogin,*/ async (req, res) => {
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
	  dateUpdated: Date.now()
    },
    function (err, docs) {
      if (err) {
        console.log("Error:", err);
        res.send(err);
      } else {
        console.log("Updated Course: ", docs);
      }
    }
  );
  res.send(dbCourse);
});


/**
 * Delete course by id
 * Delete all sections in course
 * Delete all lectures and excercises in every section in course
 * 
 * @param {string} id - course id
 * @returns {string} - Just sends a message to confirm that the deletion is complete
 */ 
router.delete("/:id"/*, requireLogin*/, async (req, res) => {
  const { id } = req.params;

  // Get the course object
  const course = await CourseModel.findById(id).catch((err) => {
    console.log(err);
  });

  // Get the section array from the course object
  const sectionIds = course.sections;

  // Loop through all sections in course
  sectionIds.map(async (section_id) => {

    // Get the section object from the id in sectionIds array
    let section = await SectionModel.findById(section_id).catch((err) => {
      console.log(err);
    });

    // Get the lecture array from the section object
    const lectureIds = section.lectures;

    // Loop through all lectures in section
    lectureIds.map(async (lecture_id) => {

      // Delete the lecture
      await LectureModel.findByIdAndDelete( lecture_id, (err) => {
        console.log(err);
      });
    });

    // Delete the section
    await SectionModel.findByIdAndDelete( section_id , (err) => {
      console.log(err);

    });
  });

  // Delete the course
  await CourseModel.findByIdAndDelete( id , (err) => {
    console.log(err);
  });

  // Send response
  res.send("Course Deleted");

});


// Update course published state
router.post("/update/published", async (req, res) => {
  const { published, course_id } = req.body;

  // find object in database and update title to new value
  (
    await CourseModel.findOneAndUpdate(
      { _id: course_id },
      { published: published }
    )
  ).save;
  course = await CourseModel.findById(course_id);

  // Send response
  res.send(course);
});


module.exports = router;
