// Mongoose model class for User
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Class description
const ContentCreator = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  motivationTextBox: { type: String },
  createdAt: { type: Date, default: new Date() },
});

const ContentCreatorApplication = mongoose.model(
  "Content-Creator-Application",
  ContentCreator
);

module.exports = { ContentCreatorApplication };
