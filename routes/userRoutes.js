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

    if (validFields) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true } // This ensures that the updated user document is returned
      );

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
    
    res.send({
			error: error
		});
  }
});

async function validateFields(fields) {
  const fieldEntries = Object.entries(fields);

  for (const [fieldName, fieldValue] of fieldEntries) {
    if (fieldName === 'email') {
      const emailValid = await validateEmail(fieldValue);
      if (!emailValid) {
        return false;
      }
    } else if (fieldName === 'firstName' || fieldName === 'lastName') {
      const nameValid = await validateName(fieldValue);
      if (!nameValid) {
        return false;
      }
    }
  }
  return true;
}


  
  module.exports = router;