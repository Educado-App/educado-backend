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


// Den fatter ikke exercise.pointsGiven...
studentSchema.post('updateOne', async function(next) {
  const completedCourses = this.schema.obj.completedCourses || [];

  completedCourses.forEach(course => {
    course.totalPoints = course.completedSections.reduce((acc, section) => {
      return acc + section.completedExercises.reduce((exerciseAcc, exercise) => {
        console.log(JSON.stringify(exercise));
        return exerciseAcc + (exercise.isComplete ? (exercise.pointsGiven || 0) : 0);
      }, 0);
    }, 0);
  });

  this.schema.obj.completedCourses = completedCourses;
});


const StudentModel = mongoose.model('students', studentSchema);

module.exports = { StudentModel };

