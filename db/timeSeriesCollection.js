const mongoose = require('mongoose');

async function createTimeSeriesCollection() {
	const db = mongoose.connection;
	try {
		const collections = await db.listCollections({ name: 'platformMetrics' }).toArray();
		if (collections.length === 0) {
			await db.createCollection('platformMetrics', {
				timeseries: {
					timeField: 'timestamp',   // Field storing the timestamp
					metaField: 'type',        // Optional metadata about the document
					granularity: 'minutes'      // Adjust granularity ("seconds", "minutes", "hours") based on your data collection frequency
				},
				expireAfterSeconds: 60, // Automatically delete documents after 5 minutes
			});
			console.log('Time-series collection created');
		} else {
			console.log('Time-series collection already exists');
		} 
	} catch (error) {
		console.error('Error creating time-series collection:', error);
	}
}

module.exports = { createTimeSeriesCollection };