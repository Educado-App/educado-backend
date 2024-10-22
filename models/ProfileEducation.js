// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
	userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	educationLevel: [String],
	status: [String],
	course: [String],
	institution: [String],
	startDate: [String],
	endDate: [String]
});

const ProfileEducationModel = mongoose.model('Education', profileSchema);

module.exports = { ProfileEducationModel };