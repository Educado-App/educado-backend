
const { MetricsModel } = require('../models/Metrics');
const { CourseModel } = require('../models/Courses');

async function addMetricsData() {
	try {
		// Fetch all unique creators from the courses collection
		const creators = await CourseModel.distinct('creator');

		// Iterate over each creator and collect metrics data
		for (const creator of creators) {
			const totalCourses = await CourseModel.countDocuments({ creator });
			const totalUsers = await CourseModel.aggregate([
				{ $match: { creator } },
				{ $group: { _id: null, totalSubscriptions: { $sum: '$numOfSubscriptions' } } }
			]);
			// Hardcoded data for testing
			const metricsData = new MetricsModel({
				timestamp: new Date(),
				type: 'snapshot',
				totalCourses: totalCourses,
				totalUsers: totalUsers[0] ? totalUsers[0].totalSubscriptions : 0,
				creatorID: creator,
			// totalUsers: totalUsers[0] ? totalUsers[0].totalSubscriptions : 0,
			// totalCourses,
			});

			// Insert the document
			//const newMetrics = new MetricsModel(metricsData);
			await metricsData.save();

			console.log('Metrics data added:', metricsData);
		}
	} catch (error) {
		console.error('Error adding metrics data:', error);
	} 
}

module.exports = { addMetricsData };