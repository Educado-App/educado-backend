const component = require('../models/Components')

// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  userPhoto: {
    type: String,
  },
  userBio: {
    type: String,
  },
  userLinkedInLink: {
    type: String,
  },
  userEmail: {
    type: String,
  },
  userName: {
    type: String,
  },




});

const ProfileModel = mongoose.model('Profile', profileSchema);

module.exports = {ProfileModel};