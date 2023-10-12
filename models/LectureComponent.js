//write lecture content schema
const mongoose = require('mongoose')
const { Schema } = mongoose;

const lectureComponentSchema = new Schema({
    title: String,
    text: String,
    parentLecture: { type: Schema.Types.ObjectId, ref: "lectures" },
}, { timestamps: true });

const LectureContentModel = mongoose.model("lectureComponents", lectureComponentSchema);

module.exports = { LectureContentModel }