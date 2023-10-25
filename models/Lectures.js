// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;


// Class description
const lectureSchema = new Schema({
    parentSection: { type: Schema.Types.ObjectId, ref: "Course" },
    title: String,
    description: String,
    dateCreated: Date,
    dateUpdated: Date,
    //components: [{ type: Schema.Types.ObjectId, ref: "Component" }],
  });
  
  // Sets LectureModel to lectures in database
  const LectureModel = mongoose.model('lectures', lectureSchema);
  
  module.exports = { LectureModel }