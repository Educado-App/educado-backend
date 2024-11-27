// Mongoose model class for User
const mongoose = require('mongoose');
const {Schema} = mongoose;

const MetricsSchema = new Schema({
	timestamp: { type: Date, required: true }, // Time of snapshot
	type: { type: String, required: true },
	totalUsers: { type: Number, required: true },
	totalCourses: { type: Number, required: true },
	creatorID: { type: Schema.Types.ObjectId, ref: 'content-creators' },
});

const MetricsModel = mongoose.model('metrics', MetricsSchema);

module.exports = { MetricsModel };