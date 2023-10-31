module.exports = function makeFakeCourse() {

	return {
		title: 'test course',
		description: 'test course description',
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
		category: 'sewing',
		published: false,
		sections: [],
		creator: [],
		difficulty: 1,
		time: 1,
		rating: 5,
	};
};
