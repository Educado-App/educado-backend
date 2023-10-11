// Mongoose model class for User
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Class description
const contentCreatorSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  motivation: { type: String },
  approved: { type: Boolean, default: false },
  rejectionReason: { type: String, required: false },
  createdAt: { type: Date },
  modifiedAt: { type: Date },
});

const ContentCreator = mongoose.model(
  "contentCreators",
  contentCreatorSchema
);


module.exports = { ContentCreator };
