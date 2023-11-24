// Mongoose model class for Applications
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Class description
const ApplicationSchema = new Schema({
  baseUser: { type: Schema.Types.ObjectId, ref: 'Users' },
  motivation: String,

  academicLevel: String,
  academicStatus: String,
  major: String,
  institution: String,
  educationStartDate: String,
  educationEndDate: String,

  company: String,
  position: String,
  workStartDate: String,
  workEndDate: String,
  workActivities: String,
});

const ApplicationModel = mongoose.model(
  "applications",
  ApplicationSchema
);

module.exports = { ApplicationModel };

