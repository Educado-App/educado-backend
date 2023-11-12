// Mongoose model class for User
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Class description
const ApplicationSchema = new Schema({
  _id: Schema.Types.ObjectId,
  ContentCreatorId: String,
  motivation: String,
  professionalExperience: String,
  academicExperience: String,
  createdAt: String,
  modifiedAt: Date,
});

const ApplicationsModel = mongoose.model(
  "applications",
  ApplicationSchema
);

module.exports = { ApplicationsModel };

