
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

			// const now = new Date();
			// const futureDate = new Date(now.getTime()+10*60000); // 10 minutes from now
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
async function addMetricsData2() {
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

			// Current date and time
			const now = new Date();

			// Add 40 minutes to the current date and time
			const futureDate = new Date(now.getTime() - 60 * 60000); // 40 minutes from now

			// Hardcoded data for testing
			const metricsData = new MetricsModel({
				timestamp: futureDate, // Use the future date with 40 minutes added
				type: 'snapshot',
				totalCourses: totalCourses,
				totalUsers: totalUsers[0] ? totalUsers[0].totalSubscriptions : 0,
				creatorID: creator,
			});

			// Insert the document
			await metricsData.save();

			console.log('Metrics data added:', metricsData);
		}
	} catch (error) {
		console.error('Error adding metrics data:', error);
	}
}

async function addTestData() {
	try {
		// Hardcoded timestamps for testing
		const hardcodedTimestamp1 = new Date(2024, 10, 28, 15, 10, 0); // November 28, 2024, 14:20:00
		const hardcodedTimestamp2 = new Date(2024, 10, 28, 15, 20, 0); // November 28, 2024, 14:21:00
		const hardcodedTimestamp3 = new Date(2024, 10, 28, 15, 30, 0); // November 28, 2024, 14:22:00 from now
		
		// Hardcoded data for testing
		const metricsData1 = new MetricsModel({
			timestamp: hardcodedTimestamp1,
			type: 'snapshot',
			totalUsers: 10,
			totalCourses: 5,
			//creatorID: 'testCreator',
		});
		const metricsData2 = new MetricsModel({
			timestamp: hardcodedTimestamp2,
			type: 'snapshot',
			totalUsers: 10,
			totalCourses: 5,
			//creatorID: 'testCreator',
		});
		const metricsData3 = new MetricsModel({
			timestamp: hardcodedTimestamp3,
			type: 'snapshot',
			totalUsers: 10,
			totalCourses: 5,
			//creatorID: 'testCreator',
		});

		// Insert the documents
		await metricsData1.save();
		await metricsData2.save();
		await metricsData3.save();

		console.log('Metrics data added:', metricsData1);
		console.log('Metrics data added:', metricsData2);
		console.log('Metrics data added:', metricsData3);
	} catch (error) {
		console.error('Error adding metrics data:', error);
	}
	
}

module.exports = { addMetricsData, addTestData, addMetricsData2 };