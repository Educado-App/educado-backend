// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
	userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	status: {
		type: String,
	},
	institution: {
		type: String,
	},
	course: {
		type: String,
	},
	educationLevel: {
		type: String,
	},
	startDate: {
		type: String,
	},
	endDate: {
		type: String,
	},
});

const ProfileEducationModel = mongoose.model('Education', profileSchema);

module.exports = { ProfileEducationModel };