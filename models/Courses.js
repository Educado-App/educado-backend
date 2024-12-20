// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Routes are sorted into COURSE - SECTION - COMPONENT each with ASCII art, within each functions are in order of CRUD
// NOTE Files do NOT delete from the backend yet, on the TODO as of 03/2022

const feedbackOptionsSubSchema = new Schema ({
	optionId: {
		type: Schema.Types.ObjectId, ref: 'feedbackoptions'
	},
	count: {
		type: Number,
		default: 0
	}
});

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
		enum: ['personal finance', 'health and workplace safety', 'sewing', 'electronics'],
	},
	creator: { 
		type: Schema.Types.ObjectId, 
		ref: 'content-creators' 
	},
	difficulty: {
		type: Number,
		min: 1,
		max: 3
	},
	status: {
		type: String,
		enum: ['draft', 'published', 'hidden'],
		default: 'draft',
	},
	estimatedHours: Number,
	rating: {
		type: Number,
		default: 0,
	},
	numOfRatings: {
		type: Number,
		default: 0
	},
	numOfSubscriptions:{
		type: Number,
		default: 0,
	},
	sections: [{ 
		type: Schema.Types.ObjectId, ref: 'sections'
	}],
	feedbackOptions:{
		type: [feedbackOptionsSubSchema],
		default: []
	}
		
});

const CourseModel = mongoose.model('courses', courseSchema); // Create new collection called courses, using the courseScema

module.exports = { CourseModel };
