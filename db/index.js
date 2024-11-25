const mongoose = require('mongoose');

function connectToDb(uri, options = {}) {

	return mongoose.connect(uri, options)
		.then(() => {
			const db = mongoose.connection;
			db.on('error', console.error.bind(console, 'MongoDB connection error'));
			console.log('Connected to MongoDB');
			return db;
		});

	
}

module.exports = { connectToDb };