const router = require('express').Router();
const { validateEmail, validateName, validatePoints } = require('../helpers/validation');
const errorCodes = require('../helpers/errorCodes');
const { User } = require('../models/User');
const requireLogin = require('../middlewares/requireLogin');

router.delete('/delete/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

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

      const updatedUser = await User.findByIdAndUpdate(
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
router.post('/:id/completed', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, sectionId, exerciseId } = req.body;

    // Retrieve the user by ID
    const user = await User.findById(id);

    if (!user) {
      throw errorCodes['E0004'];
    }

    markAsCompleted(user, courseId, sectionId, exerciseId);

    // Save the updated user object
    await user.save();

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
  await User.updateOne({ _id: user._id }, { points: user.points, level: user.level });
}


function markAsCompleted(user, courseId, sectionId, exerciseId) {
  // Check if the user has already completed the exercise
  const exerciseCompleted = user.completedExercises.includes(exerciseId);
  if (!exerciseCompleted) {
    // Add the exercise to the user's completed exercises
    user.completedExercises.push(exerciseId);
  }

  // Check if all exercises in the section are completed
  const section = user.completedSections.find((section) => section.sectionId.equals(sectionId));
  if (section) {
    const allExercisesCompleted = section.completedExercises.every((exercise) =>
      user.completedExercises.includes(exercise)
    );
    if (allExercisesCompleted && !user.completedSections.includes(sectionId)) {
      // Add the section to the user's completedSections
      user.completedSections.push(sectionId);
    }
  }

  // Check if all sections in the course are completed
  const course = user.completedCourses.find((course) => course.courseId.equals(courseId));
  if (course) {
    const allSectionsCompleted = course.completedSections.every((section) =>
      user.completedSections.includes(section)
    );
    if (allSectionsCompleted && !user.completedCourses.includes(courseId)) {
      // Add the course to the user's completedCourses
      user.completedCourses.push(courseId);
    }
  }
}

  
  module.exports = router;