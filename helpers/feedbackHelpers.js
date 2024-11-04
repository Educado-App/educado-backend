const { CourseModel } = require('../models/Courses');
const { FeedbackModel } = require('../models/Feedback');

const errorCodes = require('./errorCodes');

class CustomError extends Error {
	constructor(errorCode) {
		super(errorCode.message);
		this.name = this.constructor.name;
		this.code = errorCode.code;
	}
}


function assert(condition, errorcode) {
	if (!condition) {
		throw new CustomError(errorcode);
	}
}

function calculateAverageRating(numOfRatings, oldRating, newRating) {

	const updatedRating = ((oldRating * numOfRatings) + newRating) / (numOfRatings + 1);

	return updatedRating;
}

//If feedback option has been given to course previously, increment by 1
//otherwise add it to the history of feedbackoptions given.
function compareFeedbackOptions(feedbackOptions, newFeedbackOptions) {
	newFeedbackOptions.forEach((optionId) => {
		let isNew = true;
		for (let i = 0; i < feedbackOptions.length; i++) {
			if (feedbackOptions[i]._id == optionId) {
				feedbackOptions[i].count += 1;
				isNew = false;
				break;
			}
		}
		if (isNew) {
			feedbackOptions.push({
				_id: optionId,
				count: 1
			});
		}
	});

	return feedbackOptions;
}

//Creates a new feedback object
function createNewFeedback(courseId, rating, feedbackString, feedbackOptions) {
	return new FeedbackModel({
		courseId: courseId,
		rating: rating,
		feedbackText: feedbackString,
		feedbackOptions: feedbackOptions,
		dateCreated: Date.now()
	});
}


/**
 * Saves feedback for a course.
 *
 * @param {string} courseId - The ID of the course.
 * @param {number} rating - The rating given to the course.
 * @param {string} feedbackString - The feedback text.
 * @param {Array} feedbackOptions - The feedback options selected.
 * @returns {Promise<Object>} The updated course document.
 * @throws {Error} If any assertion fails or if saving feedback fails.
 */
async function saveFeedback(courseId, rating, feedbackString, feedbackOptions) {
	assert(typeof (rating) === 'number', errorCodes.E1303);
	assert(rating>= 1 && rating <=5, errorCodes.E1306);
	assert(feedbackOptions instanceof Array, errorCodes.E1304);

	const course = await CourseModel.findById(courseId);
	assert(course, errorCodes.E0006);

	const feedBackEntry = createNewFeedback(courseId, rating, feedbackString, feedbackOptions);
	const feedbackResult = feedBackEntry.save({ new: true });
	assert(feedbackResult, errorCodes.E1302);

	const oldFeedbackOptions = course.feedbackOptions;
	const numOfRatings = course.numOfRatings ? course.numOfRatings : 0;
	const oldRating = course.rating;
	
	const updatedRating = calculateAverageRating(numOfRatings, oldRating, rating);
	const updatedFeedbackOptions = compareFeedbackOptions(oldFeedbackOptions, feedbackOptions);
	
	const newNumOfRatings = numOfRatings + 1;
	
	const update = {
		rating: updatedRating,
		feedbackOptions: updatedFeedbackOptions,
		numOfRatings: newNumOfRatings
	};

	const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, update, {
		new: true
	});

	return updatedCourse;
}

module.exports = {
	saveFeedback
};