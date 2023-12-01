const router = require('express').Router();
const { validateEmail, validateName, validatePoints, validatePassword, ensureNewValues } = require('../helpers/validation');
const errorCodes = require('../helpers/errorCodes');
const { UserModel } = require('../models/Users');
const { StudentModel } = require('../models/Students');
const { ContentCreatorModel } = require('../models/ContentCreators');
const { ProfileModel } = require('../models/Profile');
const { ProfileEducationModel } = require('../models/ProfileEducation');
const { ProfileExperienceModel } = require('../models/ProfileExperience');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { encrypt, compare } = require('../helpers/password');

// Define a route for updating user static profile data
router.put('/update-personal', async (req, res) => {
  const {
    userID,
    userBio,
    userLinkedInLink,
    userName,
    userEmail,
    userPhoto
  } = req.body;
  
  // Require userEmail & userID && email
  if (!userEmail || !userID || !userName) {
    return res.status(400).send('All fields are required');
  }

  try {
    const user = await ProfileModel.findOne({ userID });
    // if user is not there then create new profile else update user profile
    if (!user) {
      const newProfile = new ProfileModel({
        userID,
        userPhoto: userPhoto,
        userBio,
        userLinkedInLink,
        userName,
        userEmail,
      });
      await newProfile.save();
      return res.status(200).json({ message: 'Profile created successfully', user: newProfile });
    }

    //Update profile
    const updatedData = {
      userID,
      userPhoto: userPhoto, // Use the existing photo if not provided in the request
      userBio,
      userLinkedInLink,
      userName,
      userEmail,
    };

    //if userid then update
    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userID },
      updatedData,
      { new: true }
    );

    // if there is not user display error
    if (!updatedProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    return res.status(200).json(updatedProfile);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  } 
});

//Get static user profile data using userID
router.get('/fetch/:userID', async (req,res) => {
  const {userID}=req.params; 
  try {
    const profile = await ProfileModel.findOne({userID});
    if(profile)
    {
      res.status(200).json(profile);
    }
    else{
      res.status(404).json('user not found');
    }
  } catch (error) {
    res.status(400).send('internal server error');
  } 
})


// Dynamic form Academic experience CRUD //
// Update second forms
router.put('/add-education', async (req,res)=>{
  const {userID, institution, course, startDate, endDate} = req.body;
  //Set fields by default in DB if empty
  const status = req.body.status === '' ? 'Basic' : req.body.status;
  //Require fields to be filled
  const educationLevel = req.body.educationLevel === '' ? 'Progressing': req.body.educationLevel;
  if (!userID || !institution || !course || !startDate || !endDate) {
    return res.status(400).send('All fields are required');
  }
  try {
    const newEntry = await ProfileEducationModel({userID, status, institution, course, educationLevel, startDate, endDate});
    newEntry.save();
    res.status(200).json(newEntry);
  } catch (err) {
    res.status(500).send(err.message);
  }
})

//Get second forms
router.get('/get-education/:userID', async(req,res)=>{
  const {userID} = req.params;
  //check UserID
  if (!mongoose.Types.ObjectId(userID)) {
    return res.status(500).send('Invalid userID');
  }
  try {
    const data = await ProfileEducationModel.find({userID: userID});
    if(data) {
      res.status(200).json(data);
    }
    else {
      res.status(404).send('Education Not found!');
    }
  
  } catch (error) {
    res.status(400).send('internal server error');
  }
})

//Delete dynamic entries
 router.delete('/delete-education/:_id', async (req,res)=>{
  const  {_id} = req.params;
  try {
    if(!_id){
      return res.status(400).send('_id is required');
    }

  const deleteEntry = await ProfileEducationModel.deleteOne({_id:_id});
  if (deleteEntry) {
  res.status(200).send('Entry Deleted');
}

} catch (err) {
  res.status(500).send(err.message);
} 
 })

// Dynamic form professional experience CRUD //
// Update Third forms
router.put('/add-experience', async (req,res)=>{
  const {userID, company, jobTitle, checkBool, description, startDate, endDate} = req.body;
  //Require fields to be filled
  if (!userID || !company || !jobTitle || !description || !startDate || !endDate) {
    return res.status(400).send('All fields are required');
  }
  try {
    const newEntry = await ProfileExperienceModel({userID, company, jobTitle, checkBool, description, startDate, endDate});
    newEntry.save();
    res.status(200).json(newEntry);
  } catch (err) {
    res.status(500).send(err.message);
  }
})

// Get professional experience formdata
router.get('/get-experience/:userID', async(req,res)=>{
  const {userID} = req.params;
  // Check ID
  if (!mongoose.Types.ObjectId(userID)) {
    return res.status(500).send('Invalid userID');
  }
  const data = await ProfileExperienceModel.find({userID:userID});
  res.status(200).json(data);
})

//Delete dynamic entries
router.delete('/delete-experience/:_id', async (req, res) => {
  const  {_id} = req.params;
  try {
    
    if(!_id){
      return res.status(400).send('_id is required');
    }
    const deleteEntry = await ProfileExperienceModel.deleteOne({_id:_id});
    if(deleteEntry){
    res.status(200).send('Entry Deleted');
  }

  } catch (err) {
    res.status(500).send(err.message);
  } 
});


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
		console.log(error);
		return res.status(500).send({ error: errorCodes['E0003'] });
	}
});

// GET User by ID
router.get('/:id', requireLogin, async (req, res) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).send({ error: errorCodes['E0014'] });
		}
		const id = mongoose.Types.ObjectId(req.params.id);

		const user = await UserModel.findById(id);

		return res.status(200).send(user);

	} catch (error) {
		return res.status(500).send({ error: errorCodes['E0003'] });
	}
});

// Update User with dynamic fields
router.patch('/:id', requireLogin, async (req, res) => {
	try {
		const { id } = req.params;
		const updateFields = req.body; // Fields to be updated dynamically

		if (updateFields.password) {
			return res.status(400).send({ error: errorCodes['E0803'] });
		}

		const validFields = await validateFields(updateFields);

		const user = await UserModel.findById(id);

		if (!user) {
			throw errorCodes['E0004']; // User not found
		}

		if (!ensureNewValues(updateFields, user)) {
			return res.status(400).send({ error: errorCodes['E0802'] });
		}



		if (validFields) {
			// Extracts the points and level fields from updateFields

			const updatedUser = await UserModel.findByIdAndUpdate(
				id,
				{ $set: updateFields, dateUpdated: Date.now() },
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

// Update User password
router.patch('/:id/password', requireLogin, async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).send({ error: errorCodes['E0014'] });
	}

	const id = mongoose.Types.ObjectId(req.params.id);
	const { oldPassword, newPassword } = req.body;

	if (!oldPassword || !newPassword) {
		return res.status(400).send({ error: errorCodes['E0805'] });
	}

	const user = await UserModel.findById(id);

	if (!user) {
		return res.status(400).send({ error: errorCodes['E0004'] });
	}

	if (!compare(oldPassword, user.password)) {
		return res.status(400).send({ error: errorCodes['E0806'] });
	}

	try {
		validatePassword(newPassword);
	} catch (err) {
		return res.status(400).send({ error: err });
	}

	user.password = encrypt(newPassword);
	user.dateUpdated = Date.now();

	const resUser = await UserModel.findByIdAndUpdate(id, user, { new: true });

	resUser.password = undefined;

	return res.status(200).send(user);
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