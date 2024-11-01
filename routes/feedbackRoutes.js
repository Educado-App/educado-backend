const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');

// Models
const { FeedbackOptionsModel } = require('../models/FeedbackOptions');

const { saveFeedback } = require('../helpers/feedbackHelpers.js');
const { populate } = require('../helpers/populateFeedbackOptions');


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

//Get all feedback options stored in DB
router.get('/options', async (req, res) => {
	try {
		let feedbackOptions = await FeedbackOptionsModel.find();
		if (feedbackOptions.length === 0) {
			await populate();
			feedbackOptions = await FeedbackOptionsModel.find();
		}
		return res.status(200).send(feedbackOptions);
	} catch {
		return res.status(400).send({ error: errorCodes['E0018'] }); //no feedback options found
	}
});

// Populate feedback options
router.post('/populate/new', async (req, res) => {
    try {
        await populate();
        res.send('Feedback options populated successfully');
    } catch (e) {
        return res.status(400).json({ 'error': e.message }); // Feedback options could not be populated
    }
});

module.exports = router;