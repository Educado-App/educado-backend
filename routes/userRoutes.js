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
      return res.status(204).json({ error: 'User not found' });
    }

		// Send a success response
		res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		// Handle any errors and send an error response
		console.error('Error deleting user:', error);
		res.status(500).json({ error: 'An error occurred while deleting the user' });
	}
});

// Update User Email route
router.put('/update-email/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newEmail } = req.body;

    const emailValid = await validateEmail(newEmail);

    if (emailValid) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { email: newEmail },
        { new: true } // This ensures that the updated user document is returned
      );

      if (!updatedUser) {
        throw errorCodes['E0004'];
      }

      res.status(200);
      res.send(updatedUser)
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

// Update User first name route
router.put('/update-first-name/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newFirstName } = req.body;

    const nameValid = await validateName(newFirstName);

    if (nameValid) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { firstName: newFirstName },
        { new: true } // This ensures that the updated user document is returned
      );

      if (!updatedUser) {
        throw errorCodes['E0004'];
      }

      res.status(200);
      res.send(updatedUser)
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

// Update User last name route
router.put('/update-last-name/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newLastName } = req.body;

    const nameValid = await validateName(newLastName);

    if (nameValid) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { firstName: newLastName },
        { new: true } // This ensures that the updated user document is returned
      );

      if (!updatedUser) {
        throw errorCodes['E0004'];
      }

      res.status(200);
      res.send(updatedUser)
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
  
  module.exports = router;