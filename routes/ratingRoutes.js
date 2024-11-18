const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');

// Models
const {
	getOverallRatingForCC,
	getOverallRatingOfCourse,
} = require('../helpers/feedbackHelpers.js');

// route is /api/rating

router.get('/getOverallRatingOfCourse/:courseId', async (req, res) => {
	const { courseId } = req.params;
	try {
		const averageRating = await getOverallRatingOfCourse(courseId);
		res.json({ averageRating });
	} catch (e) {
		return res.status(400).json({ error: e.message });
	}
});

router.post('/getOverallRatingOfCC/', async (req, res) => {
	console.log('Received request:', req.query); // Log the request query
	const { userid, period } = req.query;
	try {
		console.log(userid, period);
		const averageRating = await getOverallRatingForCC(userid, period);
		res.json({ averageRating });
	} catch (e) {
		return res.status(400).json({ error: e.message });
	}
});

module.exports = router;
