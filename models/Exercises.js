// Mongoose model class for Courses
const mongoose = require("mongoose");
const { component } = require("./Components");
const { Schema } = mongoose;

// Class description
const exerciseSchema = new Schema({
  parentSection: { type: Schema.Types.ObjectId, ref: "sections" },
  title: String,
  description: String,
  content: component,
  answers: [{}],
  modifiedAt: Date,
});

const ExerciseModel = mongoose.model("exercises", exerciseSchema); // Create new collection called courses, using the courseScema

module.exports = { ExerciseModel }