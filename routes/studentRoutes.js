const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { encrypt, compare } = require('../helpers/password');

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

/** SUBSCRIPTIONS **/

// Get users subscriptions
router.get('/:id/subscriptions', async (req, res) => {
  try {

    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
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
    console.log(error)
    return res.status(500).json({ 'error': errorCodes['E0003'] });
  }
});

// Checks if user is subscribed to a specific course
router.get('/subscriptions', async (req, res) => {
  try {
    const { user_id, course_id } = req.query;

    if (mongoose.Types.ObjectId.isValid(user_id) && mongoose.Types.ObjectId.isValid(course_id)) {
      return res.status(400).send({ error: errorCodes['E0014'] });
    }

    // Check if the course_id exists in the user's subscriptions array
    const user = await StudentModel.findById(user_id);

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

// Update user points and level based on earned points
async function updateUserLevel(userId, points, level) {

  // Check if user has enough points to level up
  const pointsToNextLevel = level * 100; // For example, 100 points * level to reach the next level
  if (points >= pointsToNextLevel) {
    // User has enough points to level up
    points -= pointsToNextLevel; // Deduct points needed for the level up
    level++;
  }

  // Update user points and level in the database
  await StudentModel.findOneAndUpdate({ baseUser: userId }, { points: points, level: level });
}

// Mark courses, sections, and exercises as completed for a user
router.patch('/:id/completed', requireLogin, async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw errorCodes['E0014'];
    }

    const id = mongoose.Types.ObjectId(req.params.id);

    const { exerciseId } = req.body;

    // Retrieve the user by ID
    let user = await StudentModel.findOne({ baseUser: id });

    if (!user) {
      throw errorCodes['E0004'];
    }

    const updatedUser = await markAsCompleted(user, exerciseId);

    res.status(200).send(updatedUser);
  } catch (error) {
    // Handle "user not found" error response here
    return res.status(400).send({ error: error });

  }
});

async function markAsCompleted(user, exerciseId) {

  if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
    throw errorCodes['E0014'];
  }

  // Retrieve the exercise by ID to find sectionId
  const exercise = await ExerciseModel.findById(exerciseId);

  if (!exercise) {
    throw errorCodes['E0012'];
  }

  const sectionIdString = exercise.parentSection;
  if (!mongoose.Types.ObjectId.isValid(sectionIdString)) {
    throw errorCodes['E0014'];
  }
  const sectionId = mongoose.Types.ObjectId(sectionIdString.toString());
  const section = await SectionModel.findById(sectionId);

  if (!section) {
    throw errorCodes['E0008'];
  }

  const courseIdString = section.parentCourse;
  if (!mongoose.Types.ObjectId.isValid(courseIdString)) {
    throw errorCodes['E0014'];
  }
  const courseId = mongoose.Types.ObjectId(courseIdString.toString());

  await markExerciseAsCompleted(user, courseId, sectionId, exerciseId);

  // Check if all exercises in the section are completed
  user = await StudentModel.findById(user._id);

  // Redefine the completedCourseIndex with the updated user
  const completedCourseIndex = user.completedCourses.findIndex(completedCourse => completedCourse.courseId.equals(courseId));
  const completedSection = user.completedCourses[completedCourseIndex].completedSections.find(completedSection => completedSection.sectionId.equals(sectionId));
  const allExercisesCompleted = completedSection.completedExercises.length === section.exercises.length;

  // Update section's isComplete status
  await StudentModel.findByIdAndUpdate(
    user._id,
    {
      $set: {
        [`completedCourses.${completedCourseIndex}.completedSections.$[section].isComplete`]: allExercisesCompleted
      }
    },
    {
      arrayFilters: [{ 'section.sectionId': sectionId }]
    }
  );

  user = await StudentModel.findById(user._id);

  // Check if all sections in the course are completed
  const allSectionsCompleted = user.completedCourses[completedCourseIndex].completedSections.every(completedSection => completedSection.isComplete);

  // Update course's isComplete status
  await StudentModel.findByIdAndUpdate(
    user._id,
    {
      $set: {
        [`completedCourses.${completedCourseIndex}.isComplete`]: allSectionsCompleted
      }
    }
  );

  return await StudentModel.findById(user._id);
}

async function markExerciseAsCompleted(user, courseId, sectionId, exerciseId) {
  const completedCourseIndex = user.completedCourses.findIndex(completedCourse => completedCourse.courseId.equals(courseId));

  // Check that all ids are valid

  if (completedCourseIndex === -1) {
    // Course not found, add it along with completedSections and completedExercises
    await StudentModel.findByIdAndUpdate(
      user._id,
      {
        $push: {
          completedCourses: {
            courseId,
            completedSections: [{ sectionId, completedExercises: [{ exerciseId }] }],
            isComplete: false
          }
        }
      }
    );
  } else {
    const completedSectionIndex = user.completedCourses[completedCourseIndex].completedSections.findIndex(completedSection => completedSection.sectionId.equals(sectionId));

    if (completedSectionIndex === -1) {
      // Section not found, add it along with completedExercises
      await StudentModel.findByIdAndUpdate(
        user._id,
        {
          $push: {
            [`completedCourses.${completedCourseIndex}.completedSections`]: {
              sectionId,
              completedExercises: [{ exerciseId }],
              isComplete: false
            }
          }
        }
      );
    } else {
      const isExerciseAlreadyCompleted = user.completedCourses[completedCourseIndex].completedSections.some(completedSection =>
        completedSection.sectionId.equals(sectionId) &&
        completedSection.completedExercises.some(completedExercise => completedExercise.exerciseId.equals(exerciseId))
      );

      // Returns if the exercise is already completed
      if (isExerciseAlreadyCompleted) {
        throw errorCodes['E0801'];
      }

      // Adds the exercise to the user's completedExercises array
      await StudentModel.findByIdAndUpdate(
        user._id,
        {
          $addToSet: {
            [`completedCourses.${completedCourseIndex}.completedSections.$[section].completedExercises`]: { exerciseId }
          }
        },
        {
          arrayFilters: [{ 'section.sectionId': sectionId }]
        }
      );
    }
  }
}

module.exports = router;