// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Class description
const passwordResetTokenSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	token: {
		type: String,
		required: true,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
});

const PasswordResetToken = mongoose.model('passwordResetToken', passwordResetTokenSchema);

module.exports = { PasswordResetToken };