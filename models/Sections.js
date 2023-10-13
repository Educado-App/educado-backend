const mongoose = require('mongoose');
const { Schema } = mongoose;

const sectionSchema = new Schema({
    title: String,
    description: String,
    exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
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
    components: [{ type: Schema.Types.ObjectId, ref: 'Component' }],
    parentCourse: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

const SectionModel = mongoose.model('sections', sectionSchema);

module.exports = { SectionModel };
