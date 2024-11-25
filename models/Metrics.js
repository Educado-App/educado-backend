// Mongoose model class for User
const mongoose = require('mongoose');
const {Schema} = mongoose;

const MetricsSchema = new Schema({
	timestamp: { type: Date, required: true }, // Time of snapshot
	type: { type: String, required: true },
	totalUsers: { type: Number, required: true },
	totalCourses: { type: Number, required: true },
	
});

const MetricsModel = mongoose.model('metrics', MetricsSchema);

module.exports = { MetricsModel };