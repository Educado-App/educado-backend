const router = require('express').Router();
const { validateEmail, validateName, validatePoints, validatePassword, ensureNewValues } = require('../helpers/validation');
const errorCodes = require('../helpers/errorCodes');
const { UserModel } = require('../models/Users');
const { StudentModel } = require('../models/Students');
const { ContentCreatorModel } = require('../models/ContentCreator');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { encrypt, compare } = require('../helpers/password');

router.delete('/:id', requireLogin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ error: errorCodes['E0014'] });
    }
    const id = mongoose.Types.ObjectId(req.params.id);

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(204).send(); // User not found
    }

    const deletedStudentProfile = await StudentModel.findOneAndDelete({ baseUser: id });
    const deletedContentCreatorProfile = await ContentCreatorModel.findOneAndDelete({ baseUser: id });

    return res.status(200).send({
      baseUser: deletedUser,
      studentProfile: deletedStudentProfile,
      contentCreatorProfile: deletedContentCreatorProfile
    });


  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: errorCodes['E0003'] });
  }
});

// Update User with dynamic fields
router.patch('/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body; // Fields to be updated dynamically

    if (updateFields.password) {
      return res.status(400).send({ error: errorCodes['E0803']})
    }

    const validFields = await validateFields(updateFields);

    const user = await UserModel.findById(id);

    if (!user) {
      throw errorCodes['E0004']; // User not found
    }

    if (!ensureNewValues(updateFields, user)) {
      return res.status(400).send({ error: errorCodes['E0802'] })
    }

    

    if (validFields) {
      // Extracts the points and level fields from updateFields

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: updateFields, modifiedAt: Date.now() },
        { new: true } // This ensures that the updated user document is returned
      );

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
      // Add more cases for other fields if needed
      default:
        throw errorCodes['E0801'];
    }
  }
  return true;
}

module.exports = router;