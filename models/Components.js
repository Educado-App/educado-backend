// Mongoose model class for Courses
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Class description
const componentsSchema = new Schema({
  type: String, // Image / Video / Audio / Text
  file: String, // AWS URL, if video, audio or image
  text: String, // IF component is text
  dateCreated: Date, // For all components
  dateUpdated: Date, // If its a text component
});

const ComponentModel = mongoose.model("components", componentsSchema);

module.exports = { ComponentModel }