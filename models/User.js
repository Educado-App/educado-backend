// Mongoose model class for User
const mongoose = require("mongoose")
const { Schema } = mongoose;

// Class description
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minLength: [2, "Name must be at least 2 characters"],
    maxLength: [50, "Name must be at most 50 characters"],
    validate: {
      validator: (name) => {
        /**
         * Name can contain a sequence of any letters (including foreign 
         * language letters such as ñ, Д, and 盘) followed by
         * a space, hyphen or apostrophe, repeated any number of times,
         * and ending with a sequence of any letters (at least one name). 
         */
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
        /**
         * Email must contain a sequence of any letters, numbers or dots
         * followed by an @ symbol, followed by a sequence of any letters
         * followed by a dot, followed by a sequence of two to four domain 
         * extension letters.
         */
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
  modifiedAt: Date,
  subscriptions: [{ type: Schema.Types.ObjectId, ref: "course" }]
});

const UserModel = mongoose.model("users", userSchema);

module.exports.User = UserModel
