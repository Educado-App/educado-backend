// Mongoose model class for Courses
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Class description
const lectureSchema = new Schema({
    title: String,
    description: String,
    parentSection: { type: Schema.Types.ObjectId, ref: "sections" },
    image: String,
    video: String,
    completed: Boolean,
    // components: [{ type: Schema.Types.ObjectId, ref: "lectureComponents" }]
  }, { timestamps: true });
  
  const LectureModel = mongoose.model("lectures", lectureSchema);
  module.exports = { LectureModel }
  

