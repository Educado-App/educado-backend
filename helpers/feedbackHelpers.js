const { CourseModel } = require('../models/Courses');
const { FeedbackModel } = require('../models/Feedback');
const mongoose = require('mongoose');

const errorCodes = require('../helpers/errorCodes');


function assert(condition, errorcode) {
    if (!condition) {
        console.log(errorcode.message);
    }
}

async function calculateAverageRating(parentCourse, newRating) {

    const course = await CourseModel.findById(parentCourse);
    assert(course, errorCodes.E0006);

    const amountOfRatings = await FeedbackModel.find({courseId: parentCourse}).countDocuments();
    assert(amountOfRatings, errorCodes.E0018)
   
    const rating = course.rating;

    const updatedRating = ((rating * amountOfRatings) + newRating)/(amountOfRatings+1);

    return updatedRating
}

async function updateAverageRating(parentCourse, newRating) {
    const updatedRating = await calculateAverageRating(parentCourse, newRating);
    const course = { courseId : parentCourse };
    const update = { rating : updatedRating};

    try {
        await CourseModel.findOneAndUpdate(course, update)
    } catch(e) {
        throw new Error(e.msg);
    }
}

function compareAndUpdateFeedbackOptions(oldFeedbackOptions, newFeedbackOptions) {
    //oldFeedbackOptions is [{optionId: id, count: Number}]
    return [];
}


//feedback options = array of ids for feedback options
async function updateFeedbackOptions( parentCourse, feedbackOptions ) {
    //get old counts of feedback options and +1 for all relevant feedbacks
    //what to do hvis vi fjerner feedback fra et kursus?
    
    try {
        const course = await CourseModel.findById(parentCourse);
        const courseFeedbackOptions = course.feedbackOptions;

        //
        const updatedFeedbackOptions = compareAndUpdateFeedbackOptions(parentCourse, feedbackOptions); 
    }
    catch(e) {
        throw new Error(e.msg);
    }

    return 0;
}

export async function saveFeedback(parentCourse, studentId, rating, feedbackString, feedbackOptions ) {


    return 0;
}

// export function updateFeedback() {
//     return 0;
// }

