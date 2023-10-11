// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Class description 

const sectionSchema = new Schema({
  exercises: [{ type: Schema.Types.ObjectId, ref: "exercises" }],
  title: String,
  description: String,
  sectionNumber: Number,
  createdAt: Date,
  modifiedAt: Date,
  totalPoints: Number,
  components: [{ type: Schema.Types.ObjectId, ref: "components" }],
  parentCourse: { type: Schema.Types.ObjectId, ref: "courses" },
});

const SectionModel = mongoose.model('sections', sectionSchema);

module.exports = { SectionModel };
