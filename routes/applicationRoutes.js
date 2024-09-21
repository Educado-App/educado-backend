/* eslint-disable indent */
const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
//Import all relevant models
const { ApplicationModel } = require('../models/Applications');
const { ContentCreatorModel } = require('../models/ContentCreators');
const { UserModel } = require('../models/Users'); 
const { InstitutionModel } = require('../models/Institutions'); 

//Route for when getting all applications
router.get('/', async (req, res) => {
	try {
		//Find all content creators who are not approved and not rejected
		const contentCreators = await ContentCreatorModel.find({ approved: false, rejected: false });
		//To find all appropriate users, create an array that that includes only the baseUser field of the above objects
		const baseUserArray = contentCreators.map(array => array.baseUser);
        
		//Find all users specified by array above
		const applicators = await UserModel.find({ _id: { $in: baseUserArray } });

		//Send a success response, and the relevant data
		res.send({
			success: true,
			status: 200,
			data: applicators});
            
	} catch (error) {
		//If anything unexpected happens, throw error
		return res.status(404).json({ 'error': errorCodes['E0004'] }); //User not found
	}
});

//Route for getting specific content creator, and their application
router.get('/:id', async (req, res) => {
	try {
		//Get id from the request parameters
		const { id } = req.params;
		//Find the user whose id matches the above id, and make sure password isn't a part of the object
		const applicator = await UserModel.findOne({_id: id}).select('-password');

		//Find the content creator whose "baseUser" id matches the above id
		const application = await ApplicationModel.findOne({baseUser: id});
    
		//Send a success response, and the relevant data
		res.send({
			success: true,
			status: 200,
			application: application,
			applicator: applicator});
        
        
	} catch(error) {
		//If anything unexpected happens, throw error
		return res.status(404).json({ 'error': errorCodes['E1005'] }); //Could not get Content Creator application
	}
});

//Route for approving content creator application
router.put('/:id?approve', async (req, res) => {
	try  {
		//Get id from the request parameters
		const { id } = req.params;
        
		//Find the content creator whose "baseUser" id matches the above id, and update their "approved" field to "true"
		await ContentCreatorModel.findOneAndUpdate(
			{ baseUser: id },
			{ approved: true }
		);
        
		//Return successful response
		return res.status(200).json();

	} catch(error) {
		//If anything unexpected happens, throw error
		return res.status(400).json({ 'error': errorCodes['E1003'] }); //Could not approve Content Creator
	}
});

//Route for rejecting content creator application
router.put('/:id?reject', async (req, res) => {
	try  {
		//Get id from the request parameters
		const { id } = req.params;
        
		//Find the content creator whose "baseUser" id matches the above id, and update their "rejected" field to "true"
		await ContentCreatorModel.findOneAndUpdate(
			{ baseUser: id },
			{ rejected: true }
		);

		//Return successful response
		return res.status(200).json();

	} catch(error) {
		//If anything unexpected happens, throw error
		return res.status(400).json({ 'error': errorCodes['E1004'] }); //Could not reject Content Creator
	}
});

//Route for creating new application
router.post('/newapplication', async (req, res) => {
		// Find Application 
		const application = await ApplicationModel.findOne({baseUser:req.body.baseUser});
	try {
		if(!application){
		//Define the new application based on the data from the request body
			const data = req.body;
			const applicator = await UserModel.findOne({_id: req.body.baseUser});

			//Save the data as part of the MongoDB ApplicationModel 
			const application = ApplicationModel(data);
			const createdApplication = await application.save({baseUser: applicator._id});
        
        
			//Return successful response
			return res.status(201).json({application: createdApplication});
		} else {
			return res.status(400).json({ 'error': errorCodes['E1006'] }); //Could not upload application
		}
	} catch (error) {
        
		return res.status(400).json({ 'error': errorCodes['E1006'] }); //Could not upload application
	}
	
});

//This is the only route currently required for the Institutional Onboarding, so it will be placed here for now
router.post('/newinstitution', async (req, res) => {
	try {

		const data = req.body;
        
		//Before saving the new Institution, make sure that both the Email Domains and the Institution name are unique
		const sharedName = await InstitutionModel.findOne({institutionName: data.institutionName});
		if (sharedName){
			//This Institution already exists
			return res.status(400).json({'error': errorCodes['E1202'], errorCause: data.institutionName });
		}
      
		const sharedDomain = await InstitutionModel.findOne({domain: data.domain});
  
		if (sharedDomain){
			//This Email Domain already exists as part of another Institution
			return res.status(400).json({ 'error': errorCodes['E1203'], errorCause: data.domain}); 
		}
        
		//Since the secondary domain is optional, forcibly set it to null, as to avoid any type errors
		let sharedSecondaryDomain;
		!(data.secondaryDomain) ? sharedSecondaryDomain = null : sharedSecondaryDomain = await InstitutionModel.findOne({secondaryDomain: data.secondaryDomain});
    
		if (sharedSecondaryDomain){
			//This Secondary Email Domain already exists as part of another Institution
			return res.status(400).json({ 'error': errorCodes['E1202'], errorCause: data.secondaryDomain}); 
		}

		const institutionData = InstitutionModel(data);
		const institution = await institutionData.save();

        
		//Return successful response
		return res.status(201).json({institution: institution});
        
	}
	catch (err){
		return res.status(500).json({ 'error': errorCodes['E1201']}); //Could not upload institution
	}

});

module.exports = router;
