const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');

// Models
const { db } = require('../db');
const { MetricsModel } = require('../models/Metrics');
const { CourseModel } = require('../models/Courses');
const mongoose = require('mongoose');

router.get('/:creatorID', async (req, res) => {
	const { creatorID } = req.params;
	const { startDate, endDate } = req.query;

	try {
		const query = { 'meta': 'snapshot', creatorID: mongoose.Types.ObjectId(req.params.id) };

		// Add timestamp filters if provided
		if (startDate || endDate) {
			query.timestamp = {};
			if (startDate) query.timestamp.$gte = new Date(startDate);
			if (endDate) query.timestamp.$lte = new Date(endDate);
		}

		const metrics = await db.collection('metrics').find(query).toArray();
		res.json(metrics);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch metrics' });
	}
});

router.get('/overview/:creatorID', async (req, res) => {
	const { creatorID } = req.params;

	try {
		const now = new Date();
		const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		const daily = await db.collection('metrics').aggregate([
			{ $match: { meta: 'snapshot', creatorID: ObjectId(creatorID), timestamp: { $gte: oneDayAgo } } },
			{ $group: { _id: null, totalCourses: { $sum: '$data.totalCourses' }, totalUsers: { $sum: '$data.totalUsers' } } }
		]).toArray();

		const weekly = await db.collection('metrics').aggregate([
			{ $match: { meta: 'snapshot', creatorID: ObjectId(creatorID), timestamp: { $gte: oneWeekAgo } } },
			{ $group: { _id: null, totalCourses: { $sum: '$data.totalCourses' }, totalUsers: { $sum: '$data.totalUsers' } } }
		]).toArray();

		const response = {
			totalCourses: daily[0]?.totalCourses || 0,
			totalUsers: daily[0]?.totalUsers || 0,
			weeklyChange: calculatePercentageChange(daily, weekly),
		};

		res.json(response);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch overview metrics' });
	}
});

function calculatePercentageChange(current, past) {
	const currentTotal = current[0]?.totalUsers || 0;
	const pastTotal = past[0]?.totalUsers || 0;
	if (pastTotal === 0) return null;
	return ((currentTotal - pastTotal) / pastTotal) * 100;
}

