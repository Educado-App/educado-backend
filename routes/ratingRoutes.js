const router = require('express').Router();

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

// given a user id and an optional period, return the rating of the user
router.post('/getOverallRatingOfCC/', async (req, res) => {
	const { userid, period } = req.query;
	try {
		const averageRating = await getOverallRatingForCC(userid, period);
		res.json({ averageRating });
	} catch (e) {
		return res.status(400).json({ error: e.message });
	}
});

module.exports = router;
