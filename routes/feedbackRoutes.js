const router = require('express').Router();

// Models
const { FeedbackOptionsModel } = require('../models/FeedbackOptions');

const { saveFeedback } = require('../helpers/feedbackHelpers.js');


router.post('/:courseId', async (req, res) => {
	const { courseId } = req.params;
	const { rating, feedbackText, feedbackOptions } = req.body;

	try {
		await saveFeedback(courseId, rating, feedbackText, feedbackOptions);
		res.send('OK');
	} catch (e){
		return res.status(400).json({ 'error': e.message }); //Feedback could not be saved
	}
});

//getFeedbackOptions
router.get('/options', async (req, res) => {
	try {
		const feedbackOptions = await FeedbackOptionsModel.find();
		return res.status(200).send(feedbackOptions);
	} catch {
		return res.status(400).send({errorCodes: 'E0018'}); //no feedback options found
	}
});

module.exports = router;