// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Routes are sorted into COURSE - SECTION - COMPONENT each with ASCII art, within each functions are in order of CRUD
// NOTE Files do NOT delete from the backend yet, on the TODO as of 03/2022

// Class description
const courseSchema = new Schema({
  title: String,
  category: String,
  level: String,
  description: String,
  _user: { type: Schema.Types.ObjectId, ref: "User" },
  dateCreated: Date,
  dateUpdated: Date,
  coverImg: String,
  category: String,
  published: Boolean,
  sections: [{ type: Schema.Types.ObjectId, ref: "Component" }],
});

const CourseModel = mongoose.model('courses', courseSchema); // Create new collection called courses, using the courseScema

module.exports = { CourseModel };
