const makeFakeFeedbackOptions = require('./fakeFeedbackOptions');

module.exports = function makeFakeCourse() {
	const fakeFeedbackOptions = makeFakeFeedbackOptions();
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
		numOfSubscriptions: 0,
		feedbackOpions: fakeFeedbackOptions,
	};
};

