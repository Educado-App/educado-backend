// Mongoose model class for Feedback
const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
const { Schema } = mongoose;

//Schema for providing feedback after finishing a course.
const feedbackSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId, ref: 'courses' 
    },
    userId: {
        type: Schema.Types.ObjectId, ref: 'users'
    },
    rating: {
        type: Long,
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
    },
    dateUpdated: {
        type: Date
    }
});

const FeedbackModel = mongoose.model('feedback', feedbackSchema);

module.exports = { FeedbackModel };