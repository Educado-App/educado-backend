// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ComponentModel } = require("./Components");

// Routes are sorted into COURSE - SECTION - COMPONENT each with ASCII art, within each functions are in order of CRUD
// NOTE Files do NOT delete from the backend yet, on the TODO as of 03/2022

// Class description
const courseSchema = new Schema({
  title: String,
  description: String,
  dateCreated: Date,
  dateUpdated: Date,
  coverImg: ComponentModel,
  category: String,
  published: Boolean,
  difficulty: Number,
  status: String,
  rating: Number,
  numOfSubscriptions: Number,
  estimatedHours: Number,
  sections: [{ type: Schema.Types.ObjectId, ref: "sections" }],
  creator: { type: Schema.Types.ObjectId, ref: "contentCreator" }
});

const CourseModel = mongoose.model(
  "courses", 
  courseSchema
); 

module.exports = { CourseModel }
