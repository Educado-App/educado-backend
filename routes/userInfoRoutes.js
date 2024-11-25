const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
//Import all relevant models
const { ContentCreatorModel } = require('../models/ContentCreators');
const { UserModel } = require('../models/Users'); 

//Route for when getting all applications
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

// Route for getting leaderboard data
router.get('/leaderboard', async (req, res) => {
	try {
		const { timeInterval } = req.query;
		if (!timeInterval || !['day', 'week', 'month', 'all'].includes(timeInterval)) {
			return res.status(400).json({ error: errorCodes['E0015'] });
		}
		const leaderboard = await getLeaderboard(timeInterval);
		res.status(200).json(leaderboard);
	} catch (error) {
		res.status(500).json({ error: errorCodes['E0003'], message: error.message });
	}
});

//  Route for getting specific content creator
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;

		// Find the content creator by ID
		const contentCreator = await ContentCreatorModel.findOne({ baseUser: id });

		if (!contentCreator) {
			return res.status(404).json({ 'error': errorCodes['E0004'] }); // User not found
		}

		return res.status(200).send(contentCreator);
            
	} catch (error) {
		// If anything unexpected happens, throw error
		return res.status(500).json({ 'error': error.message });
	}
});

module.exports = router;