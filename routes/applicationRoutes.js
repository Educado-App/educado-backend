const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { ApplicationModel } = require('../models/Applications');
const { ContentCreatorModel } = require('../models/ContentCreators');
const { UserModel } = require('../models/Users');

//Route for when getting all applications
router.get('/', async (req, res) => {
    try {
        //Find all content creators who are not approved and not rejected
        const contentCreators = await ContentCreatorModel.find({ approved: false, rejected: false })
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
        return res.status(500).json({ 'error': errorCodes['E0000'] });
    }
});

//Route for getting specific content creator, and their application
router.get('/:id', async (req, res) => {
    try {
        //Get id from the request parameters
        const { id } = req.params;
        //Find the user whose id matches the above id, and make sure password isn't a part of the object
        const applicator = await UserModel.findOne({_id: id}).select("-password")
        //Find the content creator whose "baseUser" id matches the above id
        const application = await ApplicationModel.findOne({baseUser: id})

        //Send a success response, and the relevant data
        res.send({success: true,
            status: 200,
            application: application,
            applicator: applicator});
        
        
    } catch(error) {
        //If anything unexpected happens, throw error
        return res.status(500).json({ 'error': errorCodes['E0000'] });
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
        return res.status(500).json({ 'error': errorCodes['E0000'] });
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
        return res.status(500).json({ 'error': errorCodes['E0000'] });
    }
});

//Route for creating new application
router.post('/newapplication', async (req, res) => {
    try{
        //Define the new application based on the data from the request body
        const data = req.body;
        //Save the data as part of the MongoDB ApplicationModel 
        ApplicationModel(data).save();
        
        //Return successful response
        return res.status(200).json();
    } catch{
        //If anything unexpected happens, throw error
        return res.status(500).json({ 'error': errorCodes['E0000'] });
    }
})

module.exports = router;