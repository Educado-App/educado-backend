const router = require('express').Router();
const { validateEmail, validateName } = require('../helpers/validation');
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
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body; // Fields to be updated dynamically

    const validFields = await validateFields(updateFields);

    if (validFields) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true } // This ensures that the updated user document is returned
      );

      // Update user points and level based on earned points
      updateUserLevel(updatedUser, updateFields.points);

      if (!updatedUser) {
        throw errorCodes['E0004'];
      }

      res.status(200).send(updatedUser);
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
      // Add more cases if needed for other fields
      default:
        // Handle default case if necessary
        break;
    }
  }
  return true;
}

// Update user points and level based on earned points
function updateUserLevel(user, earnedPoints) {
  // Add earned points to user's total points
  user.points += earnedPoints;

  // Check if user has enough points to level up
  const pointsToNextLevel = user.level * 100; // For example, 100 points * level to reach the next level
  if (user.points >= pointsToNextLevel) {
      // User has enough points to level up
      user.points -= pointsToNextLevel; // Deduct points needed for the level up
      user.level++;
  }

  // Save updated user data to the database
  user.save((err) => {
      if (error) {
          console.log(error);
      } else {
          console.log('User points and level updated successfully.');
      }
  });
}


  
  module.exports = router;