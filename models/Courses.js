// Mongoose model class for Courses
const mongoose = require('mongoose');
const { component } = require('./Components');
const { Schema } = mongoose;


// Class description
const courseSchema = new Schema({
  title: String,
  category: String,
  level: String,
  description: String,
  dateCreated: Date,
  dateUpdated: Date,
  coverImg: component,
  category: String,
  published: Boolean,
  difficulty: Number,
  status: String,
  rating: Number,
  numOfSubscriptions: Number,
  estimatedHours: Number,
  sections: [{ type: Schema.Types.ObjectId, ref: "sections" }],
  author: { type: Schema.Types.ObjectId, ref: "contentCreator" },
});

const CourseModel = mongoose.model(
  "courses", 
  courseSchema
); 

module.exports = { CourseModel }
