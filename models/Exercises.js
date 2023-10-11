const mongoose = require("mongoose")
const { component } = require("./Components");
const { Schema } = mongoose;

const exerciseSchema = new Schema ({
    parentSection: Schema.Types.ObjectId,
    title: String,
    description: String,
    content: component,
    answers: {
        text: String,
        correct: Boolean,
        modifiedAt: Date
    },
    onWrongFeedback: component,
    modifiedAt: Date,  
})

const ExerciseModel = mongoose.model(
    "exercises", 
    exerciseSchema
  ); 
  
  module.exports = { ExerciseModel }