const mongoose = require('mongoose');
const { component } = require('./Components');
const { Schema } = mongoose;

const sectionSchema = new Schema({
    title: String,
    description: String,
    exercises: [{ type: Schema.Types.ObjectId, ref: 'exercises' }],
    sectionNumber: Number,
    totalPoints: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    components: [{ type: Schema.Types.ObjectId, ref: 'lectures' }],
    parentCourse: { type: Schema.Types.ObjectId, ref: 'courses' }
});

const SectionModel = mongoose.model('sections', sectionSchema);

module.exports = { SectionModel };
