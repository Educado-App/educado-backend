// Mongoose model class for User
const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Class description
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minLength: [2, "Name must be at least 2 characters"],
    maxLength: [50, "Name must be at most 50 characters"],
    validate: {
      validator: (name) => {
        return /^(\p{L}+[ -'])*\p{L}+$/u.test(name);
      },
      message: "Invalid name"
    }
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    minLength: [6, "Email must be at least 6 characters"],
    unique: [true, "Email must be unique"],
    validate: {
      validator: (email) => {
        return /^[0-9a-zA-Z.]+@[a-zA-Z]+.[a-zA-Z]{2,4}/.test(email);
      },
      message: "Invalid email"
    },
    validate: {
      validator: async function(input) {
        let users = await UserModel.find({email: input}, function(err,docs){
          
        });
        if(users.length){
          return false;
        }
        return true;
      },
      message: 'User email already exists!'
    }
  },
  password: String,
  joinedAt: Date,
  modifiedAt: Date
});

const UserModel = mongoose.model("users", userSchema);

module.exports = { UserModel }
