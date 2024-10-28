const { CourseModel } = require('../models/Courses');
const { FeedbackModel } = require('../models/Feedback');

const errorCodes = require('../helpers/errorCodes');
const { error } = require('ajv/dist/vocabularies/applicator/dependencies');

function assert(condition, errorcode) {
	if (!condition) {
		throw new Error(errorcode.message);
	}
}

async function calculateAverageRating(courseId, newRating) {

	const course = await CourseModel.findById(courseId);
	assert(course, errorCodes.E0006);

	const amountOfRatings = await FeedbackModel.find({courseId: courseId}).countDocuments();

	const rating = course.rating;

	const updatedRating = ((rating * amountOfRatings) + newRating)/(amountOfRatings+1);

	return updatedRating;
}

//If feedback option has been given to course previously, increment by 1
//otherwise add it to the history of feedbackoptions given.
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
		if (isNew) {
			feedbackOptions.push({
				_id: optionId,
				count: 1
			});
		}
	});

	return feedbackOptions;
}


function createNewFeedback(courseId, rating, feedbackString, feedbackOptions) {
	return new FeedbackModel({
		courseId: courseId,
		rating: rating,
		feedbackText: feedbackString,
		feedbackOptions: feedbackOptions,
		dateCreated: Date.now()
	});
}


async function saveFeedback(courseId, rating, feedbackString, feedbackOptions) {
	assert(typeof(rating) === Number, errorCodes.E0020);
	assert(feedbackOptions instanceof Array, errorCodes.E0000);

	const course = await CourseModel.findById(courseId);
	assert(course, errorCodes.E0000);

	const feedBackEntry = createNewFeedback(courseId, rating, feedbackString, feedbackOptions);
	const feedbackResult = feedBackEntry.save({ new: true });
	assert(feedbackResult, errorCodes.E0000);

	const oldFeedbackOptions = course.feedbackOptions;

	const updatedRating = await calculateAverageRating(courseId, rating);
	const updatedFeedbackOptions = compareFeedbackOptions(oldFeedbackOptions, feedbackOptions);

	const update = {
		rating: updatedRating,
		feedbackOptions: updatedFeedbackOptions
	};

	const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, update, {
		new: true
	});

	assert(updatedCourse.rating === updatedRating, errorCodes.E0000);
	// console.log(updatedCourse.feedbackOptions);
	// console.log(updatedFeedbackOptions);
	// assert(updatedCourse.feedbackOptions === updatedFeedbackOptions, errorCodes.E0001);

	return updatedCourse;
}

module.exports = {
	saveFeedback
};

