const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
//Import all relevant models
const { ContentCreatorModel } = require('../models/ContentCreators');
const { UserModel } = require('../models/Users'); 

router.get('/', async (req, res) => {
    try {
        // Find all content creators
        const contentCreators = await ContentCreatorModel.find();
        // Create an array that includes only the baseUser field of the above objects
        const baseUserArray = contentCreators.map(array => array.baseUser);
        
        // Find all users specified by array above
        const applicators = await UserModel.find({ _id: { $in: baseUserArray } });

        // Merge contentCreators data with applicators data
        const mergedData = applicators.map(applicator => {
            const contentCreator = contentCreators.find(cc => cc.baseUser.toString() === applicator._id.toString());
            return {
                ...applicator.toObject(),
                approved: contentCreator ? contentCreator.approved : undefined,
                rejected: contentCreator ? contentCreator.rejected : undefined,
            };
        });

        // Send a success response, and the relevant data
        res.send({
            success: true,
            status: 200,
            data: mergedData,
        });
            
    } catch (error) {
        // If anything unexpected happens, throw error
        return res.status(404).json({ 'error': errorCodes['E0004'] }); // User not found
    }
});

module.exports = router;