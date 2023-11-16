// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;


// Class description
const lectureSchema = new Schema({
    parentSection: { type: Schema.Types.ObjectId, ref: "Section" },
    title: String,
    description: String,
    contentType: {
      type: String,
      enum: ['text', 'video'],
    },
    content: String,
    dateCreated: Date,
    dateUpdated: Date,
    //components: [{ type: Schema.Types.ObjectId, ref: "Component" }],
  });
  
  // Sets LectureModel to lectures in database
  const LectureModel = mongoose.model('lectures', lectureSchema);
  module.exports = { LectureModel }