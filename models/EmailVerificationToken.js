const mongoose = require('mongoose');
const { Schema } = mongoose;

const emailVerificationTokenSchema = new Schema({
	userEmail: {
		type: String,
		required: true
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

const EmailVerificationToken = mongoose.model('emailVerificationToken', emailVerificationTokenSchema);

module.exports = { EmailVerificationToken };