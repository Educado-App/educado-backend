// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
	userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	company: {
		type: String,
	},
	jobTitle: {
		type: String,
	},
	startDate:{
		type: String,
	},
	endDate: {
		type: String,
	},
	checkBool: {
		type: Boolean,
	},
	description: {
		type: String,
	},
});

const ProfileExperienceModel = mongoose.model('Experience', profileSchema);

module.exports = { ProfileExperienceModel };