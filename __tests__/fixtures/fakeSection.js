module.exports = function makeFakeSection() {

	return {
		title: 'test section',
		description: 'this is a test section',
		sectionNumber: 1,
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
		totalPoints: 100,
		components: [],
		parentCourse: '',
	};
};