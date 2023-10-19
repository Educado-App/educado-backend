const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema({
    parentSection: { type: Schema.Types.ObjectId, ref: 'Sections' },
    description: {
        type: String,
        required: true
    },
    content: {
        type: Schema.Types.ObjectId,
        ref: 'Component',
        required: true
    },
    answers: [{
        text: {
            type: String,
            required: true
        },
        correct: {
            type: Boolean,
            required: true
        },
        modifiedAt: {
            type: Date,
            default: Date.now,
            required: true
        }
    }],
    onWrongFeedback: {
        type: Schema.Types.ObjectId,
        ref: 'Component'
    },
    modifiedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const ExerciseModel = mongoose.model('exercises', exerciseSchema);

module.exports = { ExerciseModel };
