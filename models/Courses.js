// Mongoose model class for Courses
const mongoose = require('mongoose');
const { component } = require('./Components');
const { Schema } = mongoose;


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
	coverImg: String,
	category: {
    type: String,
    enum: ['personal finance', 'health and workplace safety', 'sewing', 'flectronics', 'other'],
  },
	published: Boolean,
	sections: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Component' 
  }],
  creator: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
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
});

const CourseModel = mongoose.model(
  "courses", 
  courseSchema
); 

module.exports = { CourseModel }
