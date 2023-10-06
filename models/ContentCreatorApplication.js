// Mongoose model class for User
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Class description
const ContentCreatorSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	motivation: { type: String },
	approved: { type: Boolean, default: false },
	rejectionReason: { type: String, required: false },
	createdAt: { type: Date },
	modifiedAt: { type: Date },
});

const ContentCreatorApplication = mongoose.model(
	'Content-Creator-Application',
	ContentCreatorSchema
);

module.exports = { ContentCreatorApplication };
