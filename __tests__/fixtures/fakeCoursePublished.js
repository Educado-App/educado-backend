module.exports = function makeFakeCoursePublished(){
	return {
		title: 'test course published',
		description: 'test course description',
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
		category: 'sewing',
		status: 'published',
		sections: [],
		difficulty: 1,
		estimatedHours: 1,
		rating: 5,
		numOfRatings: 0,
		numOfSubscriptions: 0,
	};
};