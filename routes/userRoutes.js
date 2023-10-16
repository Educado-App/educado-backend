const router = require('express').Router();
const { validateEmail, validateName, validatePoints } = require('../helpers/validation');
const errorCodes = require('../helpers/errorCodes');
const { UserModel } = require('../models/Users');
const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { ExerciseModel } = require('../models/Exercises');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');

router.delete('/delete/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      throw errorCodes['E0004'];
    } else {
      res.status(200);
      res.send(deletedUser)
    }

	} catch (error) {
		if (error === errorCodes['E0004']) {
      // Handle "user not found" error response here
      res.status(204);
    } else {
      res.status(400);
    }
    
    console.log(error);
    res.send({
			error: error
		});
	}
});

// Update User with dynamic fields
router.patch('/:id', /*requireLogin,*/ async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body; // Fields to be updated dynamically

    const validFields = await validateFields(updateFields);

    if (validFields) {
      // Extracts the points and level fields from updateFields
      const { points, level, ...otherFields } = updateFields;

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: otherFields },
        { new: true } // This ensures that the updated user document is returned
      );

      if (!updatedUser) {
        throw errorCodes['E0004'];
      }

      if (!isNaN(points)) {
        updateUserLevel(updatedUser, updateFields.points)
      }
    
      res.status(200).send(updatedUser);
    }

  } catch (error) {
    if (error === errorCodes['E0004']) {
      // Handle "user not found" error response here
      res.status(404);
    } else {
      res.status(400);
    }
    
    console.log(error);
    res.send({
			error: error
		});
  }
});

// Mark courses, sections, and exercises as completed for a user
router.patch('/:id/completed', /*requireLogin,*/ async (req, res) => {
  try {
    const { id } = req.params;
    const { exerciseId } = req.body;

    // Retrieve the user by ID
    const user = await UserModel.findById(id);

    if (!user) {
      throw errorCodes['E0004'];
    }

    markAsCompleted(user, exerciseId);

    res.status(200).send(user);
  } catch (error) {
    if (error === errorCodes['E0004']) {
      // Handle "user not found" error response here
      res.status(404);
    } else {
      res.status(400);
    }
    
    console.log(error);
    res.send({
			error: error
		});
  }
});


async function validateFields(fields) {
  const fieldEntries = Object.entries(fields);

  for (const [fieldName, fieldValue] of fieldEntries) {
    switch (fieldName) {
      case 'email':
        const emailValid = await validateEmail(fieldValue);
        if (!emailValid) {
          return false;
        }
        break;
      case 'firstName':
      case 'lastName':
        const nameValid = await validateName(fieldValue);
        if (!nameValid) {
          return false;
        }
        break;
      case 'points':
        const pointsValid = await validatePoints(fieldValue);
        if (!pointsValid) {
          return false;
        }
        break;
      // Add more cases if needed for other fields
      default:
        // Handle default case if necessary
        break;
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
  try {
      // Retrieve the exercise by ID to find sectionId
      const exercise = await ExerciseModel.findById(exerciseId);
      const sectionIdString = exercise.parentSection;
      const sectionId = mongoose.Types.ObjectId(sectionIdString.toString());
      const section = await SectionModel.findById(sectionId);
      const courseIdString = section.parentCourse;
      const courseId = mongoose.Types.ObjectId(courseIdString.toString());
      const course = await CourseModel.findById(courseId);

      // Check if the course is in completedCourses
      //console.log(JSON.stringify(user, null, 2)); // Log the user object to inspect its structure
      const completedCourseIndex = user.completedCourses.findIndex(completedCourse => completedCourse.courseId.equals(courseId));
      //console.log("Completed Course Index: " + completedCourseIndex); // Log the completedCourseIndex to check its value

      if (completedCourseIndex === -1) {
          // Course not found, add it along with completedSections and completedExercises
          await UserModel.updateOne(
              { _id: user._id },
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
          // Course found, check if section is completed
          const completedSectionIndex = user.completedCourses[completedCourseIndex].completedSections.findIndex(completedSection => completedSection.sectionId.equals(sectionId));

          if (completedSectionIndex === -1) {
              // Section not found, add it along with completedExercises
              await UserModel.updateOne(
                  { _id: user._id, 'completedCourses.courseId': courseId },
                  {
                      $push: {
                          'completedCourses.$.completedSections': {
                              sectionId,
                              completedExercises: [{ exerciseId }],
                              isComplete: false
                          }
                      }
                  }
              );
          } else {
            const isExerciseAlreadyCompleted = user.completedCourses[completedCourseIndex].completedSections.
            some(completedSection => completedSection.completedExercises.some(completedExercise => completedExercise.exerciseId.equals(exerciseId)));

            // Returns if the exercise is already completed
            if(isExerciseAlreadyCompleted) {
              return;
            }

            // Adds the exercise to the user's completedExercises array
            await UserModel.updateOne(
                {
                    _id: user._id,
                    'completedCourses.courseId': courseId,
                    'completedCourses.completedSections.sectionId': sectionId
                },
                {
                    $addToSet: {
                        'completedCourses.$.completedSections.$[section].completedExercises': { exerciseId }
                    }
                },
                {
                    arrayFilters: [{ 'section.sectionId': sectionId }]
                }
            );
          }
      }

      // Check if all exercises in the section are completed
      user = await UserModel.findById(user._id);
      console.log(JSON.stringify(user, null, 2)); // Log the user object to inspect its structure
      const completedSection = user.completedCourses[completedCourseIndex].completedSections.find(completedSection => completedSection.sectionId.equals(sectionId));
      const allExercisesCompleted = completedSection.completedExercises.length === section.exercises.length;

      // Update section's isComplete status
      await UserModel.updateOne(
          {
              _id: user._id,
              'completedCourses.courseId': courseId,
              'completedCourses.completedSections.sectionId': sectionId
          },
          {
              $set: {
                  'completedCourses.$.completedSections.$[section].isComplete': allExercisesCompleted
              }
          },
          {
              arrayFilters: [{ 'section.sectionId': sectionId }]
          }
      );

      // Check if all sections in the course are completed
      const allSectionsCompleted = user.completedCourses[completedCourseIndex].completedSections.every(completedSection => completedSection.isComplete);

      console.log("allSectionsCompleted: " + allSectionsCompleted)

      // Update course's isComplete status
      await UserModel.updateOne(
          { _id: user._id, 'completedCourses.courseId': courseId },
          {
              $set: {
                  'completedCourses.$.isComplete': allSectionsCompleted
              }
          }
      );
  } catch (error) {
      // Handle errors
      console.error(error);
  }
}

module.exports = router;