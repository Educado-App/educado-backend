// Mongoose model class for User
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Class description
const userSchema = new Schema({
  email: String,
  password: String,
  joinedAt: Date,
  modifiedAt: Date
});

const UserModel = mongoose.model('users', userSchema);

module.exports.User = UserModel;
