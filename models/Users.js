// Mongoose model class for User
const mongoose = require('mongoose')
const { Schema } = mongoose;
const patterns = require('../helpers/patterns');

// Class description
const userSchema = new Schema({
	firstName: {
		type: String,
		required: [true, 'First name is required'],
		minLength: [1, 'First name must be at least 2 characters'],
		maxLength: [50, 'First name must be at most 50 characters'],
		validate: {
			validator: (firstName) => {
				/**
         * Name can contain a sequence of any letters (including foreign 
         * language letters such as ñ, Д, and 盘) followed by
         * a space, hyphen or apostrophe, repeated any number of times,
         * and ending with a sequence of any letters (at least one name). 
         */
				return /^(\p{L}+[ -'])*\p{L}+$/u.test(firstName);
			},
			message: 'Invalid first name'
		}
	},
	lastName: {
		type: String,
		required: [true, 'Last name is required'],
		minLength: [1, 'Last name must be at least 2 characters'],
		maxLength: [50, 'Last name must be at most 50 characters'],
		validate: {
			validator: (lastName) => {
				/**
         * Name can contain a sequence of any letters (including foreign 
         * language letters such as ñ, Д, and 盘) followed by
         * a space, hyphen or apostrophe, repeated any number of times,
         * and ending with a sequence of any letters (at least one name). 
         */
				return /^(\p{L}+[ -'])*\p{L}+$/u.test(lastName);
			},
			message: 'Invalid last name'
		}
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		minLength: [6, 'Email must be at least 6 characters'],
		unique: [true, 'Email must be unique'],
		validate: {
			validator: (email) => {
				/**
         * Email must contain a sequence of any letters, numbers or dots
         * followed by an @ symbol, followed by a sequence of any letters
         * followed by a dot, followed by a sequence of two to four domain 
         * extension letters.
         */
        return patterns.email.test(email);
      },
      message: 'Invalid email'
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
  subscriptions: [{
      type: Schema.Types.ObjectId,
      ref: 'Courses'
  }],
  points: {
    type: Number,
    default: 0
  },
  level: {
      type: Number,
      default: 1
  },
  completedCourses: [
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Courses'
        },
        completedSections: [
            {
                sectionId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Sections'
                },
                completedExercises: [
                    {
                        exerciseId: {
                            type: Schema.Types.ObjectId,
                            ref: 'Exercises'
                        },
                        isComplete: {
                          type: Boolean,
                          default: true
                        }
                    }
                ],
                isComplete: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        isComplete: {
            type: Boolean,
            default: false
        }
    }
]
});

const UserModel = mongoose.model('users', userSchema);

module.exports.UserModel = UserModel
