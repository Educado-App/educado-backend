
const { MetricsModel } = require('../models/Metrics');

async function addMetricsData() {
	try {
		
		// Hardcoded data for testing
		const metricsData = {
			timestamp: new Date(),
			type: 'snapshot',
			totalUsers: 100,
			totalCourses: 10,
		};
		const metricsData2 = {
			timestamp: new Date(),
			type: 'snapshot',
			totalUsers: 70,
			totalCourses: 12,
		};

		// Insert the document
		const newMetrics = new MetricsModel(metricsData);
		await newMetrics.save();

		console.log('Metrics data added:', newMetrics);

		const newMetrics2 = new MetricsModel(metricsData2);
		await newMetrics2.save();
		console.log('Metrics data added:', newMetrics2);

	} catch (error) {
		console.error('Error adding metrics data:', error);
	} 
}

addMetricsData();