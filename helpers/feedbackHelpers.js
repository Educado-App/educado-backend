const { CourseModel } = require('../models/Courses');
const { FeedbackModel } = require('../models/Feedback');

const errorCodes = require('../helpers/errorCodes');


function assert(condition, errorcode) {
	if (!condition) {
		console.log(errorcode.message);
	}
}

async function calculateAverageRating(courseId, newRating) {

	// const course = await CourseModel.findById(courseId);
	// assert(course, errorCodes.E0006);

	// const amountOfRatings = await FeedbackModel.find({courseId: courseId}).countDocuments();
	// assert(amountOfRatings, errorCodes.E0018);
   
	// const rating = course.rating;

	// const updatedRating = ((rating * amountOfRatings) + newRating)/(amountOfRatings+1);

	// return updatedRating;

	return newRating;
}

function compareAndUpdateFeedbackOptions(oldFeedbackOptions, newFeedbackOptions) {
	console.log(oldFeedbackOptions[0].optionId);
}


// //feedback options = array of ids for feedback options
// async function updateFeedbackOptions( courseId, feedbackOptions ) {
// 	//get old counts of feedback options and +1 for all relevant feedbacks
// 	//what to do hvis vi fjerner feedback fra et kursus?
	
// 	try {
// 		const course = await CourseModel.findById(courseId);
// 		const courseFeedbackOptions = course.feedbackOptions;

// 		const updatedFeedbackOptions = compareAndUpdateFeedbackOptions(courseId, feedbackOptions);

// 	}
// 	catch(e) {
// 		throw new Error(e.msg);
// 	}

// 	return 0;
// }

function createNewFeedback(courseId, studentId, feedbackString, feedbackOptions, rating){
	return {
		courseId: courseId,
		studentId: studentId,
		rating: rating,
		feedbackText: feedbackString,
		feedbackOptions: feedbackOptions,
		dateCreated: Date.now()
	};
}


// export async function saveFeedback(courseId, rating, feedbackString, feedbackOptions ) {
async function saveFeedback(courseId, rating) {
	const course = await CourseModel.findById(courseId);
	assert(course, errorCodes.E0000);    

	const updatedRating = await calculateAverageRating(courseId, rating);
	
	
	const update = {
		rating: updatedRating
	};

	const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, update, {
		new: true
	});

	assert(updatedCourse.rating === updatedRating, errorCodes.E0000);

	return updatedCourse;
}

module.exports = {
	saveFeedback
};

// export function updateFeedback() {
//     return 0;
// }

