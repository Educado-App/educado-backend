const router = require('express').Router();
const { validateEmail, validateName, validatePoints, validatePassword } = require('../helpers/validation');
const errorCodes = require('../helpers/errorCodes');
const { UserModel } = require('../models/Users');
const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { ExerciseModel } = require('../models/Exercises');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { encrypt, compare } = require('../helpers/password');

router.delete('/delete/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      throw errorCodes['E0004']; // User not found
    } else {
      res.status(200);
      res.send(deletedUser)
    }

  } catch (error) {
    if (error === errorCodes['E0004']) { // User not found
      // Handle "user not found" error response here
      res.status(204);
    } else {
      res.status(400);
    }

    res.send({
      error: error
    });
  }
});

// Update User with dynamic fields
router.patch('/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body; // Fields to be updated dynamically

    const validFields = await validateFields(updateFields);

    const user = await UserModel.findById(id);

    if (!ensureNewValues(updateFields, user)) {
      return res.status(400).send({ error: errorCodes['E0802'] })
    }

    if(updateFields.password) {
      updateFields.password = encrypt(updateFields.password);
    }

    if (validFields) {
      // Extracts the points and level fields from updateFields
      const { points, level, ...otherFields } = updateFields;

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: otherFields, modifiedAt: Date.now() },
        { new: true } // This ensures that the updated user document is returned
      );

      if (!updatedUser) {
        throw errorCodes['E0004']; // User not found
      }

      if (!isNaN(points)) {
        updateUserLevel(updatedUser, updateFields.points)
      }
    
      res.status(200).send(updatedUser);
    }

  } catch (error) {
    if (error === errorCodes['E0004']) { // User not found
      // Handle "user not found" error response here
      res.status(404).send({ error: errorCodes['E0004'] });
    } else {
      res.status(400).send({ error: error });
    }
  }
});

// Mark courses, sections, and exercises as completed for a user
router.patch('/:id/completed', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { exerciseId } = req.body;

    // Retrieve the user by ID
    let user = await UserModel.findById(id);

    
    if (!user) {
      throw errorCodes['E0004'];
    }

    const updatedUser = await markAsCompleted(user, exerciseId);

    res.status(200).send(updatedUser);
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

/** SUBSCRIPTIONS **/

// Get users subscriptions
router.get('/:id/subscriptions', async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by _id and select the 'subscriptions' field
    const user = await UserModel.findById(userId).select('subscriptions');

    //checks if user exist
    if (!user) {
      // Handle "user not found" error response here
      return res.status(404).json({ 'error': errorCodes['E0004'] });
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

// Checks if user is subscribed to a specific course
router.get('/subscriptions', async (req, res) => {
  try {
    const { user_id, course_id } = req.query;

    // Check if the course_id exists in the user's subscriptions array
    const user = await UserModel.findById(user_id);

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


/**
 * Validates the fields to be updated dynamically
 */
async function validateFields(fields) {
  const fieldEntries = Object.entries(fields);

  for (const [fieldName, fieldValue] of fieldEntries) {
    switch (fieldName) {
      case 'email':
        if (!(await validateEmail(fieldValue))) {
          return false;
        }
        break;
      case 'firstName':
      case 'lastName':
        if (!validateName(fieldValue)) {
          return false;
        }
        break;
      case 'password':
        if (!validatePassword(fieldValue)) {
          return false;
        }
        break;
      case 'points':
        if (!validatePoints(fieldValue)) {
          return false;
        }
        break;
      // Add more cases for other fields if needed
      default:
        throw errorCodes['E0801'];
    }
  }
  return true;
}

function ensureNewValues(newValues, oldValues) {
  const newEntries = Object.entries(newValues);

  for (const [fieldName, fieldValue] of newEntries) {
    if (fieldName === 'password' && compare(fieldValue, oldValues.password)) {
      return false;
    } else if (fieldValue === oldValues[fieldName]) {
      return false;
    }
  }

  return true;
}

// Update user points and level based on earned points
async function updateUserLevel(user, earnedPoints) {
  // Add earned points to user's total points
  user.points += earnedPoints;

  // Check if user has enough points to level up
  const pointsToNextLevel = user.level * 100; // For example, 100 points * level to reach the next level
  if (user.points >= pointsToNextLevel) {
    // User has enough points to level up
    user.points -= pointsToNextLevel; // Deduct points needed for the level up
    user.level++;
  }

  // Update user points and level in the database
  await UserModel.updateOne({ _id: user._id }, { points: user.points, level: user.level });
}


async function markAsCompleted(user, exerciseId) {
  // Retrieve the exercise by ID to find sectionId
  const exercise = await ExerciseModel.findById(exerciseId);

  if (!exercise) {
    throw errorCodes['E0012'];
  }

  const sectionIdString = exercise.parentSection;
  const sectionId = mongoose.Types.ObjectId(sectionIdString.toString());
  const section = await SectionModel.findById(sectionId);

  if (!section) {
    throw errorCodes['E0008'];
  }

  const courseIdString = section.parentCourse;
  const courseId = mongoose.Types.ObjectId(courseIdString.toString());
  
  await markExerciseAsCompleted(user, courseId, sectionId, exerciseId);
  
  // Check if all exercises in the section are completed
  user = await UserModel.findById(user._id);
  
  // Redefine the completedCourseIndex with the updated user
  const completedCourseIndex = user.completedCourses.findIndex(completedCourse => completedCourse.courseId.equals(courseId));
  const completedSection = user.completedCourses[completedCourseIndex].completedSections.find(completedSection => completedSection.sectionId.equals(sectionId));
  const allExercisesCompleted = completedSection.completedExercises.length === section.exercises.length;

  // Update section's isComplete status
  await UserModel.findByIdAndUpdate(
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

  user = await UserModel.findById(user._id);
  
  // Check if all sections in the course are completed
  const allSectionsCompleted = user.completedCourses[completedCourseIndex].completedSections.every(completedSection => completedSection.isComplete);

  // Update course's isComplete status
  await UserModel.findByIdAndUpdate(
      user._id,
      {
          $set: {
              [`completedCourses.${completedCourseIndex}.isComplete`]: allSectionsCompleted
          }
      }
  );

  return await UserModel.findById(user._id);
}

async function markExerciseAsCompleted(user, courseId, sectionId, exerciseId) {
  const completedCourseIndex = user.completedCourses.findIndex(completedCourse => completedCourse.courseId.equals(courseId));

  if (completedCourseIndex === -1) {
      // Course not found, add it along with completedSections and completedExercises
      await UserModel.findByIdAndUpdate(
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
          await UserModel.findByIdAndUpdate(
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
          await UserModel.findByIdAndUpdate(
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