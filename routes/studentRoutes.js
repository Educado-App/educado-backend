const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { markAsCompleted } = require('../helpers/completing');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { findTop100Students } = require('../helpers/leaderboard');
const { addIncompleteCourse } = require('../helpers/completing');
const { StudentModel } = require('../models/Students');
const { CourseModel } = require('../models/Courses');

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
      res.send('true');
    } else {
      // User is not subscribed to the course
      res.send('false');
    }

  } catch (error) {
    // If the server could not be reached, return an error message
    return res.status(500).json({ 'error': errorCodes['E0003'] });
  }
});

router.patch('/:id/courses/:courseId/enroll', requireLogin, async (req, res) => {
  try {
    const { id, courseId } = req.params;

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
    // If the server could not be reached, return an error message
    return res.status(500).json({ 'error': errorCodes['E0003'] });
  }
});


// Mark courses, sections, and components as completed for a user
router.patch('/:id/complete', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    let { comp, isComplete, points } = req.body;

    let student = await StudentModel.findOne({ baseUser: id });

    if (!student) {
      return res.status(404).json({ error: errorCodes['E0004'] });
    }

    const updatedStudent = await markAsCompleted(student, comp, points, isComplete);

    res.status(200).send(updatedStudent);
  } catch (error) {
    // If the server could not be reached, return an error message
    return res.status(500).json({ 'error': errorCodes['E0003'] });
  }
});

// Update the current extra points for a student like daily streaks
router.put('/:id/extraPoints', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { extraPoints } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: errorCodes['E0014'] });
    }

    if (isNaN(extraPoints)) {
      return res.status(400).json({ error: errorCodes['E0804'] });
    }

    const student = await StudentModel.findOneAndUpdate(
      { baseUser: id },
      {
        $inc: {
          currentExtraPoints: extraPoints
        }
      }
    );

    if (!student) {
      return res.status(404).json({ error: errorCodes['E0004'] });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: errorCodes['E0003'] });
  }
});

/* NOT USED  */
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