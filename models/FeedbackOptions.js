// Mongoose model class for FeedbackOptions
const mongoose = require('mongoose');
const { Schema } = mongoose;


const feedbackOptionsSchema = new Schema({
    name: { type: String, required: [true, "Feedback option needs a descriptive name"] },
    color: { type: String, required: true }
});

const FeedbackOptionsModel = mongoose.model('feedbackOptions', feedbackOptionsSchema);

module.exports = { FeedbackOptionsModel };