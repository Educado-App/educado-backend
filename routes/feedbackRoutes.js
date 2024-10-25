const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');

// Models
const { FeedbackOptionsModel } = require('../models/FeedbackOptions');

const { saveFeedback } = require('../helpers/feedbackHelpers.js');


router.post('/:courseId', async (req, res) => {
	const { courseId } = req.params;
	console.log("params", req.params)
	console.log("body", req.body)
	const { rating, feedbackText, feedbackOptions } = req.body;

	try {
		await saveFeedback(courseId, rating, feedbackText, feedbackOptions);
		console.log("Feedback saved")
		res.send('OK');
	} catch (e) {
		// return res.status(400).json({error: errorCodes['E0019']});
		return res.status(400);
	}
});

//getFeedbackOptions
router.get('/options', async (req, res) => {
	try {
		const feedbackOptions = await FeedbackOptionsModel.find();
		return res.status(200).send(feedbackOptions);
	} catch {
		return res.status(400);
	}
});

module.exports = router;