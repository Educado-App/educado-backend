// Mongoose model class for Feedback
const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
const { Schema } = mongoose;

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
        type: String//maybe change to type: Schema.Types.ObjectId, ref: 'feedback options'
    }]

    

})