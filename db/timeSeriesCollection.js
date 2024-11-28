const mongoose = require('mongoose');

async function createTimeSeriesCollection() {
	const db = mongoose.connection.db;
	try {
		const collections = await db.listCollections({ name: 'metrics' }).toArray();
		if (collections.length === 0) {
			await db.createCollection('metrics', {
				timeseries: {
					timeField: 'timestamp',   // Field storing the timestamp
					metaField: 'type',        // Optional metadata about the document
					granularity: 'minutes'      // Adjust granularity ("seconds", "minutes", "hours") based on your data collection frequency
				},
				expireAfterSeconds: 60, // Automatically delete documents after 5 minutes
			}
			);
			console.log('Time-series collection created');
		} else {
			console.log('Time-series collection already exists');
		} 

		// Add the TTL index
		const indexes = await db.collection('metrics').listIndexes().toArray();
		const ttlIndexExists = indexes.some(index => index.name === 'timestamp_1');
	
		if (!ttlIndexExists) {
			await db.collection('metrics').createIndex(
				{ timestamp: 1 },
				{ expireAfterSeconds: 60,
					partialFilterExpression: { type: 'snapshot' }
				} 
			);
			console.log('TTL index created successfully!');
		} else {
			console.log('TTL index already exists.');
			const indexes = await db.collection('metrics').listIndexes().toArray();
			console.log(indexes); // Ensure 'timestamp_1' TTL index is listed with expireAfterSeconds: 50.

		}
	} catch (error) {
		console.error('Error creating time-series collection:', error);
	}
}

module.exports = { createTimeSeriesCollection };