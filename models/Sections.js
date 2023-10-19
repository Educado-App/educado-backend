const mongoose = require('mongoose');
const { component } = require('./Components');
const { Schema } = mongoose;

const sectionSchema = new Schema({
  exercises: [{ type: Schema.Types.ObjectId, ref: "exercise" }],
  title: String,
  description: String,
  sectionNumber: Number,
  totalPoints: Number,
  parentCourse: { type: Schema.Types.ObjectId, ref: "Course" },
  components: [{ type: Schema.Types.ObjectId, ref: "lectures" }],
}, { timestamps: true });

const SectionModel = mongoose.model('sections', sectionSchema);

module.exports = { SectionModel };
