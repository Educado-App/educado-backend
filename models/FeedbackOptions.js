// Mongoose model class for FeedbackOptions
const mongoose = require('mongoose');
const { Schema } = mongoose;


const feedbackOptionsSchema = new Schema({
	name: { 
		type: String,
		required: [true, 'Feedback option needs a descriptive name']
	},
});

const FeedbackOptionsModel = mongoose.model('feedbackoptions', feedbackOptionsSchema);

module.exports = { FeedbackOptionsModel };