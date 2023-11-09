// Mongoose model class for User
const mongoose = require('mongoose')
const { Schema } = mongoose;

// Class description
const studentSchema = new Schema({
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  subscriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Courses'
  }],
  completedCourses: [
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Courses'
        },
        totalPoints: {
          type: Number,
          default: 0
        },
        isComplete: {
            type: Boolean,
            default: true
        },
        completionDate: {
            type: Date,
            default: Date.now
        },
        completedSections: [
            {
                sectionId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Sections'
                },
                totalPoints: {
                  type: Number,
                  default: 0
                },
                isComplete: {
                  type: Boolean,
                  default: true
                },
                completionDate: {
                    type: Date,
                    default: Date.now
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
                        },
                        completionDate: {
                          type: Date,
                          default: Date.now
                        },
                        pointsGiven: Number
                    }
                ]
            }
        ]
    }
],
  baseUser: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }
});

const StudentModel = mongoose.model('students', studentSchema);

module.exports = { StudentModel };

