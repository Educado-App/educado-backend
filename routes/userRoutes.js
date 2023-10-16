const router = require('express').Router();
const { validateEmail, validateName, validatePassword } = require('../helpers/validation');
const errorCodes = require('../helpers/errorCodes');
const { User } = require('../models/User');
const { CourseModel } = require('../models/Courses');
const requireLogin = require('../middlewares/requireLogin');
const { encrypt, compare } = require('../helpers/password');

router.delete('/delete/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

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

    const user = await User.findById(id);

    if (!ensureNewValues(updateFields, user)) {
      return res.status(400).send({ error: errorCodes['E0702'] })
    }

    if(updateFields.password) {
      updateFields.password = encrypt(updateFields.password);
    }

    if (validFields) {
      const updatedUser = await User.findByIdAndUpdate( id, { $set: updateFields }, { new: true })

      if (!updatedUser) {
        throw errorCodes['E0004']; // User not found
      }

      res.status(200).send(updatedUser);
    }

  } catch (error) {
    if (error === errorCodes['E0004']) { // User not found
      // Handle "user not found" error response here
      res.status(204).send({ error: errorCodes['E0004'] }); // User not found
    } else {
      res.status(400).send({ error: error.message });
    }
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
      case 'firstName' || 'lastName':
        if (!validateName(fieldValue)) {
          return false;
        }
        break;
      case 'password':
        if (!validatePassword(fieldValue)) {
          return false;
        }
        break;
      // Add more cases for other fields if needed
      default:
        throw new Error('Illegal field name');
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

/** SUBSCRIPTIONS **/

// Get users subscriptions
router.get('/:id/subscriptions', async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by _id and select the 'subscriptions' field
    const user = await User.findById(userId).select('subscriptions');

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
    console.log(error);
    return res.status(500).json({ 'error': errorCodes['E0003'] }); // server could not be reached
  }
});



// Checks if user is subscribed to a specific course
router.get('/subscriptions', async (req, res) => {
  try {
    const { user_id, course_id } = req.query;

    // Check if the course_id exists in the user's subscriptions array
    const user = await User.findById(user_id);

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
    console.log(error);
    return res.status(500).json({ 'error': errorCodes['E0003'] }); // server could not be reached
  }
});



module.exports = router;