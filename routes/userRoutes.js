const router = require('express').Router();
const { validateEmail, validateName, validatePoints, validatePassword, ensureNewValues } = require('../helpers/validation');
const errorCodes = require('../helpers/errorCodes');
const { UserModel } = require('../models/Users');
const { StudentModel } = require('../models/Students');
const { ContentCreatorModel } = require('../models/ContentCreators');
const { ContentCreator } = require('../models/ContentCreatorApplication');
const { ProfileModel } = require('../models/Profile');
const { ProfileEducationModel } = require('../models/ProfileEducation');
const { ProfileExperienceModel } = require('../models/ProfileExperience');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { encrypt, compare } = require('../helpers/password');

// Define a route for updating user profile data
router.put('/updateProfile', async (req, res) => {
  const {
    userID,
    userBio,
    userLinkedInLink,
    userName,
    userEmail,
    userPhoto
  } = req.body;

  if (!req.body.userEmail || !req.body.userID) {
    return res.status(400).json({ error: errorCodes['E0202'] }); //Password or email is missing
  }

  try {
    const user = await ProfileModel.findOne({ userID });
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
    const updatedData = {
      userID,
      userPhoto: userPhoto, // Use the existing photo if not provided in the request
      userBio,
      userLinkedInLink,
      userName,
      userEmail,
    };

    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userID },
      updatedData,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    return res.status(200).json(updatedProfile);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  } 
});

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
    console.log('Errror: ',error);
    res.status(400).send('User Profile didnot exist!');
  } 
})

router.get('/fetchuser/:email', async (req,res) =>{
  const {email} = req.params; 
  const user = await ContentCreator.findOne({email});
  res.status(200).json(user);
})

// Dynamic form Academic experience CRUD

router.post('/addEducation', async (req,res)=>{
  const {userID, status, institution, course, educationLevel, startDate, endDate} = req.body;
  try {
    const newEntry = await ProfileEducationModel({userID, status, institution, course, educationLevel, startDate, endDate})
    newEntry.save();
    res.status(200).json(newEntry)
  } catch (err) {
    res.status(500).send(err.message)
  }
})
router.get('/getEducation', async(req,res)=>{
  const {userID} = req.query;
  const data = await ProfileEducationModel.find({userID:userID});
  res.status(200).json(data)
})

 router.delete('/deleteEducation', async (req,res)=>{
  const  {_id} = req.query;
  
  try {
    
    if(!_id){
      return res.status(404).send('_id is required')
    }

  const deleteEntry = await ProfileEducationModel.deleteOne({_id:_id});
  res.status(200).send('Entry Deleted')

} catch (err) {
  res.status(500).send(err.message)
} 
 })
// Dynamic form professional experience CRUD

router.post('/addExperience', async (req,res)=>{
  const {userID, company, jobTitle, checkBool, description, startDate, endDate} = req.body;
  try {
    const newEntry = await ProfileExperienceModel({userID, company, jobTitle, checkBool, description, startDate, endDate})
    newEntry.save();
    res.status(200).json(newEntry)
  } catch (err) {
    res.status(500).send(err.message)
  }
})

router.get('/getExperience', async(req,res)=>{
  const {userID} = req.query;
  const data = await ProfileExperienceModel.find({userID:userID});
  res.status(200).json(data)
})
router.delete('/deleteExperience', async (req, res) => {
  const  {_id} = req.query;
  try {
    
    if(!_id){
      return res.status(404).send('_id is required')
    }

    const deleteEntry = await ProfileExperienceModel.deleteOne({_id:_id});
    res.status(200).send('Entry Deleted')

  } catch (err) {
    res.status(500).send(err.message)
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
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ error: errorCodes['E0014'] });
  }

  const id = mongoose.Types.ObjectId(req.params.id);
  const { oldPassword, newPassword } = req.body;

  if(!oldPassword || !newPassword) {
    return res.status(400).send({ error: errorCodes['E0805'] });
  }

  const user = await UserModel.findById(id);

  if(!user) {
    return res.status(400).send({ error: errorCodes['E0004'] });
  }

  if(!compare(oldPassword, user.password)) {
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