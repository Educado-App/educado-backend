// Mongoose model class for User
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Class description
const ContentCreatorSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  motivationTextBox: { type: String },
  createdAt: { type: Date, default: new Date() },
  approved: { type: Boolean, required: false, default: false },
  rejectionReason: { type: String, required: false },
});

const ContentCreatorApplication = mongoose.model(
  "Content-Creator-Application",
  ContentCreatorSchema
);

module.exports = { ContentCreatorApplication };
