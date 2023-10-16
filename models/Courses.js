const component = require('../models/Components')

// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Routes are sorted into COURSE - SECTION - COMPONENT each with ASCII art, within each functions are in order of CRUD
// NOTE Files do NOT delete from the backend yet, on the TODO as of 03/2022

// Class description
const courseSchema = new Schema({
	title: {
    type: String,
    required: [true, 'Title is required'],
  },
	description: {
    type: String,
    required: [true, 'Description is required'],
  },
	dateCreated: Date,
	dateUpdated: Date,
	coverImg: component,
	category: {
    type: String,
    enum: ['Math', 'Science', 'Finance', 'Language', 'Sustainability', 'Other'],
  },
	published: Boolean,
  creator: { 
    type: Schema.Types.ObjectId, 
    ref: 'contentCreator' 
  },
  difficulty: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'hidden'],
    default: 'draft',
  },
  estimatedHours: Number,
  rating: {
    Number,
  },
  numOfSubscriptions:{
    type: Number,
    default: 0,
  },
  sections: [{ 
    type: Schema.Types.ObjectId, ref: "sections"
  }],
});

const CourseModel = mongoose.model('courses', courseSchema); // Create new collection called courses, using the courseScema

module.exports = { CourseModel };


