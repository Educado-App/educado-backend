const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { markAsCompleted, updateUserLevel } = require('../helpers/completing');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { findTop100Students } = require('../helpers/leaderboard');
const { addIncompleteCourse } = require('../helpers/completing');

const { ExerciseModel } = require('../models/Exercises');
const { StudentModel } = require('../models/Students');
const { SectionModel } = require('../models/Sections');
const { CourseModel } = require('../models/Courses');

router.patch('/:id', requireLogin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ error: errorCodes['E0014'] });
  }

  const id = mongoose.Types.ObjectId(req.params.id);

  const { points, level } = req.body;

  let student = await StudentModel.findOne({ baseUser: id });

  let updatedUser;

  if (points !== null && (points <= 0 || isNaN(points))) {
    return res.status(400).send({ error: errorCodes['E0804'] });
  }

  if (points !== null) {
    try {
      updatedUser = await updateUserLevel(id, points + student.points, student.level);
    } catch (err) {
      return res.status(400).send({ error: err });
    }
  }

  return res.status(200).send(updatedUser);
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
      res.send("true");
    } else {
      // User is not subscribed to the course
      res.send("false");
    }

  } catch (error) {
    // If the server could not be reached, return an error message
    return res.status(500).json({ 'error': errorCodes['E0003'] });
  }
});

router.patch('/:id/addCourse', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId } = req.body;

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
    throw error;
  }
})

// Mark courses, sections, and exercises as completed for a user
router.patch('/:id/completed', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    let { comp, isComplete, points } = req.body;

    // Retrieve the user by ID MAYBE CHANGE TO STUDENT ID
    let student = await StudentModel.findOne({ baseUser: id });

    if (!student) {
      throw errorCodes['E0004'];
    }

    const updatedStudent = await markAsCompleted(student, comp, points, isComplete);

    res.status(200).send(updatedStudent);
  } catch (error) {
    if (error === errorCodes['E0004'] || error === errorCodes['E0008'] || error === errorCodes['E0012']) {
      // Handle "user not found" error response here
      res.status(404);
    } else {
      res.status(400);
    }

    res.send({
      error: error
    });
  }
});

// Get the 100 students with the highest points, input is the time interval (day, week, month, all)
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeInterval } = req.body;

    if (!timeInterval) {
      throw errorCodes['E0015'];
    }

    const leaderboard = await findTop100Students(timeInterval);

    res.status(200).send(leaderboard);
  } catch (error) {
    // Handle errors appropriately
    if (error === errorCodes['E0015']) {
      res.status(500).json({ 'error': errorCodes['E0015'] });
    } else {
      res.status(500).json({ 'error': errorCodes['E0003'] });
    }
  }
});

module.exports = router;