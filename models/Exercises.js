const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema({
    parentSection: { type: Schema.Types.ObjectId, ref: 'Sections' },
    title: {
        type: String,
        required: true
    },
    question: {
        type: String,
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
        feedback: {
            type: String,
            required: true
        },
        dateUpdated: {
            type: Date,
            default: Date.now,
            required: true
        }
    }],
    onWrongFeedback: {
        type: Schema.Types.ObjectId,
        ref: 'Component'
    },
    dateCreated: {
        type: Date,
        default: Date.now,
        required: true
    },
    dateUpdated: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const ExerciseModel = mongoose.model('exercises', exerciseSchema);

module.exports = { ExerciseModel }
