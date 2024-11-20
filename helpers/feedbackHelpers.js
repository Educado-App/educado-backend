const { CourseModel } = require('../models/Courses');
const { ContentCreatorModel } = require('../models/ContentCreators');
const { FeedbackModel } = require('../models/Feedback');

const errorCodes = require('./errorCodes');
const { assert } = require('./error');


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

async function getAllFeedback() {
	const feedback = await FeedbackModel.find();
	return feedback;
}

async function getFeedbackForCourse(courseId) {
	const feedback = await FeedbackModel.find({ courseId: courseId });
	return feedback;
}

async function getOverallRatingOfCourse(courseId) {
	// search for all feedbacks for the course with the given courseId and calculate the average rating
	const feedback = await FeedbackModel.find({ courseId: courseId });
	let totalRating = 0;
	let totalNumOfRatings = 0;
	feedback.forEach((entry) => {
		totalRating += entry.rating;
		totalNumOfRatings += 1;
	});
	if (totalNumOfRatings === 0) { return -1; }
	return totalRating / totalNumOfRatings;
}


async function findContentCreatorFromUserID(userID) {
	const contentCreator = await ContentCreatorModel.findOne({ baseUser: userID });
	return contentCreator._id;
}


// given a user id and an optional period, return the rating of the user
async function getOverallRatingForCC(userid, period = null) {
	const contentCreator = await findContentCreatorFromUserID(userid);
	const query = { creator: contentCreator };
	// possible period values: 'this_month', 'last_month', '7_days', 'this_year', 'all'
	if (period) {
		const now = new Date();
		let start;
		switch (period) {
		case 'this_month':
			start = new Date(now.getFullYear(), now.getMonth(), 1);
			break;
		case 'last_month'://TODO: check if this works for january
			start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			break;
		case '7_days':
			start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case 'this_year':
			start = new Date(now.getFullYear(), 0, 1);
			break;
		default:
			start = new Date(0);
		}
		query.dateCreated = { $gte: start, $lt: now };
	}

	const courses = await CourseModel.find(query);
	let totalRating = 0;
	let totalNumOfCoursesWithRatings = 0;
	courses.forEach((course) => {
		if (course.numOfRatings !== 0) { 
			totalRating += course.rating * course.numOfRatings;
			totalNumOfCoursesWithRatings += course.numOfRatings;
		}
	});
	if (totalNumOfCoursesWithRatings === 0) { return 0; }
	return totalRating / totalNumOfCoursesWithRatings;
}

module.exports = {
	saveFeedback,
	getAllFeedback,
	getFeedbackForCourse,
	getOverallRatingForCC,
	getOverallRatingOfCourse
};