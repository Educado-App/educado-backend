// Mongoose model class for Feedback
const mongoose = require('mongoose');
const { Schema } = mongoose;

//Schema for providing feedback after finishing a course.
const feedbackSchema = new Schema({
	courseId: {
		type: Schema.Types.ObjectId, ref: 'courses',
		required: [true, 'course id is required']
		
	},
	rating: {
		type: Number,
		required: [true, 'rating is required']
	},
	feedbackText: {
		type : String
	},
	feedbackOptions: [{
		type: Schema.Types.ObjectId, ref: 'feedbackOptions'
	}],
	dateCreated: {
		type: Date
	}
});

const FeedbackModel = mongoose.model('feedbacks', feedbackSchema);

module.exports = { FeedbackModel };