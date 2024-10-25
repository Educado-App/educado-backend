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

function compareFeedbackOptions(feedbackOptions, newFeedbackOptions) {
	newFeedbackOptions.forEach((option) => {
		const optionId = option._id;
		let isNew = true;

		for (let i = 0; i < feedbackOptions.length; i++) {
			if (feedbackOptions[i]._id == optionId) {
				feedbackOptions[i].count += 1;
				isNew = false;
				break;
			}
		}
		if(isNew) {
			feedbackOptions.push({
				_id: optionId,
				count: 1
			})
		}
	});

	return feedbackOptions;
}


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


async function saveFeedback(courseId, rating, feedbackString, feedbackOptions) {
	const course = await CourseModel.findById(courseId);
	assert(course, errorCodes.E0000);
	
	const oldFeedbackOptions = course.feedbackOptions;

	const updatedRating = await calculateAverageRating(courseId, rating);
	const updatedFeedbackOptions = compareFeedbackOptions(oldFeedbackOptions, feedbackOptions);

	console.log(feedbackString);

	const update = {
		rating: updatedRating,
		feedbackOptions: updatedFeedbackOptions
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

