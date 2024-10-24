const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { ProfileModel } = require('../models/Profile');
const { ProfileEducationModel } = require('../models/ProfileEducation');
const { ProfileExperienceModel } = require('../models/ProfileExperience');
const mongoose = require('mongoose');


// Define a route for updating user static profile data
router.put('/', async (req, res) => {
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
		return res.status(400).json({ error: errorCodes['E0202'] });
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
router.get('/:userID', async (req, res) => {
	const { userID } = req.params;
	try {
		const profile = await ProfileModel.findOne({ userID });
		if (profile) {
			res.status(200).json(profile);
		}
		else {
			res.status(404).json('user not found');
		}
	} catch (error) {
		res.status(400).send('internal server error');
	}
});


// Dynamic form Academic experience CRUD //
// Update second forms
/* router.put('/educations', async (req, res) => {
	const { userID, institution, course, startDate, endDate } = req.body;
	//Set fields by default in DB if empty
	const status = req.body.status === '' ? 'Basic' : req.body.status;
	//Require fields to be filled
	const educationLevel = req.body.educationLevel === '' ? 'Progressing' : req.body.educationLevel;
	if (!userID || !institution || !course || !startDate || !endDate) {
		return res.status(400).send('All fields are required');
	}
	try {
		const newEntry = await ProfileEducationModel({ userID, status, institution, course, educationLevel, startDate, endDate });
		newEntry.save();
		res.status(200).json(newEntry);
	} catch (err) {
		res.status(500).send(err.message);
	}
}); */

// Route to update academic experience forms on /profile and /application endpoints
router.put('/educations', async (req, res) => {
	const { userID, educationLevel, status, course, institution, startDate, endDate } = req.body;

	// Check if all arrays have the same length
	const arrayLength = institution.length;

    // Validate that userID is present and all required fields are arrays of the same number of elements
	if (!userID ||
		[educationLevel, status, course, institution, startDate, endDate].some(
			(arr) => !Array.isArray(arr) || arr.length !== arrayLength)) 
	{
		return res.status(400).send('All fields are required, and arrays must have the same length!');
	}

	try {
		// Create a new ProfileEducationModel for each form
		const newEntries = [];
		for (let i = 0; i < arrayLength; i++) {
			const newEntry = new ProfileEducationModel({
				userID,
				educationLevel: educationLevel[i],
				status: status[i],
				course: course[i],
				institution: institution[i],
				startDate: startDate[i],
				endDate: endDate[i]
			});
			await newEntry.save();
			newEntries.push(newEntry);
		}
		res.status(200).json(newEntries);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

//Get second forms
router.get('/educations/:userID', async (req, res) => {
	const { userID } = req.params;
	//check UserID
	if (!mongoose.Types.ObjectId(userID)) {
		return res.status(500).send('Invalid userID');
	}
	try {
		const data = await ProfileEducationModel.find({ userID: userID });
		if (data) {
			res.status(200).json(data);
		}
		else {
			res.status(404).send('Education Not found!');
		}

	} catch (error) {
		res.status(400).send('internal server error');
	}
});

//Delete dynamic entries
router.delete('/educations/:_id', async (req, res) => {
	const { _id } = req.params;
	try {
		if (!_id) {
			return res.status(400).send('_id is required');
		}

		const deleteEntry = await ProfileEducationModel.deleteOne({ _id: _id });
		if (deleteEntry) {
			res.status(200).send('Entry Deleted');
		}
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// Dynamic form professional experience CRUD //
// Update Third forms
/* router.put('/experiences', async (req, res) => {
	const { userID, company, jobTitle, isCurrentJob, description, startDate, endDate } = req.body;
	// Require fields to be filled, but ensure that either endDate or isCurrentJob is provided (not both, though)
	if (!userID || !company || !jobTitle || !description || !startDate) { // || (!endDate && !isCurrentJob) || (endDate && isCurrentJob))
		return res.status(400).send('All fields are required');
	}
	try {
		const newEntry = await ProfileExperienceModel({ userID, company, jobTitle, isCurrentJob, description, startDate, endDate });
		newEntry.save();
		res.status(200).json(newEntry);
	} catch (err) {
		res.status(500).send(err.message);
	}
}); */

// Route to update professional experience forms on /profile and /application endpoints
router.put('/experiences', async (req, res) => {
	const { userID, company, jobTitle, startDate, endDate, isCurrentJob, description } = req.body;

	// Check if all arrays have the same length
	const arrayLength = company.length;

	// Validate that userID is present and all required fields are arrays of the same number of elements
	if (!userID ||
		[company, jobTitle, startDate, endDate, isCurrentJob, description].some(
			(arr) => !Array.isArray(arr) || arr.length !== arrayLength)) 
	{
		return res.status(400).send('All fields are required, and arrays must have the same length!');
	}

	try {
		const newEntries = [];
		for (let i = 0; i < arrayLength; i++) {
			const newEntry = new ProfileExperienceModel({
				userID,
				company: company[i],
				jobTitle: jobTitle[i],
				startDate: startDate[i],
				endDate: endDate[i],
				isCurrentJob: isCurrentJob[i],
				description: description[i]
			});
			await newEntry.save();
			newEntries.push(newEntry);
		}
		res.status(200).json(newEntries);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// Get professional experience formdata
router.get('/experiences/:userID', async (req, res) => {
	const { userID } = req.params;
	// Check ID
	if (!mongoose.Types.ObjectId(userID)) {
		return res.status(500).send('Invalid userID');
	}
	const data = await ProfileExperienceModel.find({ userID: userID });
	res.status(200).json(data);
});

//Delete dynamic entries
router.delete('/experiences/:_id', async (req, res) => {
	const { _id } = req.params;
	try {

		if (!_id) {
			return res.status(400).send('_id is required');
		}
		const deleteEntry = await ProfileExperienceModel.deleteOne({ _id: _id });
		if (deleteEntry) {
			res.status(200).send('Entry Deleted');
		}

	} catch (err) {
		res.status(500).send(err.message);
	}
});
module.exports = router;