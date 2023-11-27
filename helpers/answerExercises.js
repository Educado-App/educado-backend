const { StudentModel } = require('../models/Students');
const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { ExerciseModel } = require('../models/Exercises');
const { updateCompletedCoursesTotalPoints, updateCompletedSectionsTotalPoints } = require('../helpers/pointSystem');
const errorCodes = require('../helpers/errorCodes');
const mongoose = require('mongoose');

let courseId, sectionId, exerciseId, points, isComplete;

async function markAsCompleted(user, exerciseIdFromFunction, pointsFromFunction, isCompleteFromFunction) {
    // Retrieve the exercise by ID to find sectionId
    const exercise = await ExerciseModel.findById(exerciseIdFromFunction);
    exerciseId = exerciseIdFromFunction
  
    if (!exercise) {
      throw errorCodes['E1104'];
    }
  
    const sectionIdString = exercise.parentSection;
    sectionId = mongoose.Types.ObjectId(sectionIdString.toString());
    const section = await SectionModel.findById(sectionId);
  
    if (!section) {
      throw errorCodes['E0008'];
    }
  
    const courseIdString = section.parentCourse;
    courseId = mongoose.Types.ObjectId(courseIdString.toString());

    points = pointsFromFunction;
    isComplete = isCompleteFromFunction;
  
    await markExerciseAsCompleted(user);
  
    // Check if all exercises in the section are completed
    user = await StudentModel.findOne({ baseUser: user.baseUser });

    exercisesInSection = await ExerciseModel.find({ parentSection: sectionId });
  
    // Redefine the completedCourseIndex with the updated user
    const completedCourseIndex = user.completedCourses.findIndex(completedCourse => completedCourse.courseId.equals(courseId));
    const completedSection = user.completedCourses[completedCourseIndex].completedSections.find(completedSection => completedSection.sectionId.equals(sectionId));
  
    // Check if all exercises are present and marked as complete
    const allExercisesCompleted = completedSection.completedExercises.length === exercisesInSection.length &&
      completedSection.completedExercises.every(completedExercise => completedExercise.isComplete);
  
    // Update the totalPoints field for the completedSection and completedCourse
    await updateCompletedSectionsTotalPoints(user.baseUser, sectionId, completedCourseIndex);
    await updateCompletedCoursesTotalPoints(user.baseUser, courseId, completedCourseIndex);
  
    // Update section's isComplete status, and afterwards update the points for the specific course and section for the user.
    await StudentModel.findOneAndUpdate(
      { baseUser: user.baseUser },
      {
        $set: {
          [`completedCourses.${completedCourseIndex}.completedSections.$[section].isComplete`]: allExercisesCompleted,
          [`completedCourses.${completedCourseIndex}.completedSections.$[section].completionDate`]: Date.now()
        }
      },
      {
        arrayFilters: [{ 'section.sectionId': sectionId }]
      }
    )
  
    user = await StudentModel.findOne({ baseUser: user.baseUser });
  
    // Check if all sections in the course are completed
    const allSectionsCompleted = user.completedCourses[completedCourseIndex].completedSections.every(completedSection => completedSection.isComplete);
  
    // Update course's isComplete status
    await StudentModel.findOneAndUpdate(
      { baseUser: user.baseUser },
      {
        $set: {
          [`completedCourses.${completedCourseIndex}.isComplete`]: allSectionsCompleted,
          [`completedCourses.${completedCourseIndex}.completionDate`]: Date.now()
        }
      }
    );  
  
    return await StudentModel.findOne({ baseUser: user.baseUser });
}

async function markExerciseAsCompleted(user) {
    const completedCourseIndex = user.completedCourses.findIndex(completedCourse => completedCourse.courseId.equals(courseId));
    if (completedCourseIndex === -1) {
        await addCourseWithSectionAndExercise(user);
    } else {
        await handleSectionOrExerciseNotFound(user, completedCourseIndex)
    }
}

async function addCourseWithSectionAndExercise(user) {
    // Course not found, add it along with completedSections and completedExercises
    await StudentModel.findOneAndUpdate(
        { baseUser: user.baseUser },
        {
            $push: {
            completedCourses: {
                courseId,
                completedSections: [{ sectionId, completedExercises: [{ exerciseId, isComplete, pointsGiven: points }] }]
            }
            }
        }
    );  
}

async function handleSectionOrExerciseNotFound(user, completedCourseIndex) {
    const completedSectionIndex = user.completedCourses[completedCourseIndex].completedSections.findIndex(completedSection => completedSection.sectionId.equals(sectionId));

    if (completedSectionIndex === -1) {
        // Section not found, add it along with completedExercises
        await addSectionWithExercise(user, sectionId, exerciseId, points, isComplete)
    } else {
        let exerciseFound;

        // Check if the exercise is in the user's completedExercises array
        user.completedCourses[completedCourseIndex].completedSections.some(section => {
            section.completedExercises.forEach(exercise => {
            if (exercise.exerciseId == exerciseId) {
                // Found the matching exerciseId, set exerciseIsComplete to the associated isComplete value
                exerciseFound = exercise;
            }
            });
        });

        // If the exercise is already in the array, check it's isComplete value, if true throw error,
        // else update the exercise field "isComplete" to true, and points to the points given (5).
        // If exerciseFound is false, the exercise is simply added to the array.
        await updateStatusForExercise(user, exerciseFound)    
    }
}

async function addSectionWithExercise(user) {
    await StudentModel.findOneAndUpdate(
        { baseUser: user.baseUser },
        {
        $push: {
            'completedCourses.$.completedSections': {
            sectionId,
            completedExercises: [{ exerciseId, isComplete, pointsGiven: points }]
            }
        }
        }
    );     
}

async function updateStatusForExercise(user, exerciseFound) {
    if (exerciseFound) {
        if (exerciseFound.isComplete) {
            throw errorCodes['E0801'];
        } else {
            // Update the exercise field "isComplete" to true, and points to the points given
            await StudentModel.updateOne(
                {
                baseUser: user.baseUser,
                'completedCourses.courseId': courseId,
                'completedCourses.completedSections.sectionId': sectionId,
                'completedCourses.completedSections.completedExercises.exerciseId': exerciseId
                },
                {
                $set: {
                    'completedCourses.$.completedSections.$[section].completedExercises.$[exercise].pointsGiven': points,
                    'completedCourses.$.completedSections.$[section].completedExercises.$[exercise].isComplete': isComplete,
                    'completedCourses.$.completedSections.$[section].completedExercises.$[exercise].completionDate': Date.now()
                }
                },
                {
                arrayFilters: [{ 'section.sectionId': sectionId }, { 'exercise.exerciseId': exerciseId }]
                }
            );
            return;
        }
    }

    // Adds the exercise to the user's completedExercises array
    await StudentModel.findOneAndUpdate(
        {
        baseUser: user.baseUser,
        'completedCourses.courseId': courseId,
        'completedCourses.completedSections.sectionId': sectionId
        },
        {
        $addToSet: {
            'completedCourses.$.completedSections.$[section].completedExercises': { exerciseId, isComplete, pointsGiven: points }
        }
        },
        {
        arrayFilters: [{ 'section.sectionId': sectionId }]
        }
    );  
}

module.exports = {
	markAsCompleted
};
