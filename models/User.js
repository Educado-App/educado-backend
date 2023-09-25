// Mongoose model class for User
const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Class description
const userSchema = new Schema({
  googleID: String,
  email: String,
  password: String,
  joinedAt: Date,
  modifiedAt: Date,
  subscriptions: [String]
});

const UserModel = mongoose.model("users", userSchema);

module.exports = { UserModel }
