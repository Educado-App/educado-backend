module.exports = function makeFakeCourse() {

	return {
		title: 'test course',
		description: 'test course description',
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
		category: 'sewing',
		published: false,
		sections: [],
		difficulty: 1,
		rating: 5,
    numOfSubscriptions: 0,
	};
};
