const makeCourseFakeFeedbackOptions = require('./fakeCourseFeedbackOptions');

module.exports = function makeFakeCourse() {
	const fakeCourseFeedbackOptions = makeCourseFakeFeedbackOptions();
	return {
		title: 'test course',
		description: 'test course description',
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
		category: 'sewing',
		status: 'draft',
		sections: [],
		difficulty: 1,
		estimatedHours: 1,
		rating: 5,
		numOfRatings: 0,
		numOfSubscriptions: 0,
		feedbackOptions: fakeCourseFeedbackOptions,
	};
};

