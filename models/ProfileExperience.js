// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
	userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	company: String,
	jobTitle: String,
	startDate: String,
	endDate: String,
	isCurrentJob: Boolean,
	description: String
});

const ProfileExperienceModel = mongoose.model('Experience', profileSchema);

module.exports = { ProfileExperienceModel };