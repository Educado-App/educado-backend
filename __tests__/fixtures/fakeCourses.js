const makeCourseFakeFeedbackOptions = require('./fakeCourseFeedbackOptions');

const fakeCourseFeedbackOptions = makeCourseFakeFeedbackOptions();

const courses = [
	{
		'title': 'fakeCourse1',
		'description': 'fakeCourse1 description',
		'dateCreated': new Date().toJSON(),
		'dateUpdated': new Date().toJSON(),
		'category': 'mathematics',
		'published': false,
		'sections': [],
		'creator': '673e05109203b5ba64409b20',
		'difficulty': 1,
		'estimatedHours': 1,
		'rating': 5,
		'numOfRatings': 0,
		'feedbackOpions': fakeCourseFeedbackOptions,
	},
	{
		'title': 'fakeCourse2',
		'description': 'fakeCourse2 description',
		'dateCreated': new Date().toJSON(),
		'dateUpdated': new Date().toJSON(),
		'category': 'language',
		'published': false,
		'sections': [],
		'creator': '673e05109203b5ba64409b20',
		'difficulty': 1,
		'estimatedHours': 1,
		'rating': 5,
		'numOfRatings': 0,
		'feedbackOpions': fakeCourseFeedbackOptions,
	},
	{
		'title': 'fakeCourse3',
		'description': 'fakeCourse3 description',
		'dateCreated': new Date().toJSON(),
		'dateUpdated': new Date().toJSON(),
		'category': 'programming',
		'published': true,
		'sections': [],
		'creator': '673e05109203b5ba64409b20',
		'difficulty': 2,
		'estimatedHours': 3,
		'rating': 5,
		'numOfRatings': 0,
		'feedbackOpions': fakeCourseFeedbackOptions,
	},
	{
		'title': 'fakeCourse4',
		'description': 'fakeCourse4 description',
		'dateCreated': new Date().toJSON(),
		'dateUpdated': new Date().toJSON(),
		'category': 'music',
		'published': true,
		'sections': [],
		'creator': '673e05109203b5ba64409b20',
		'difficulty': 6,
		'estimatedHours': 2,
		'rating': 3,
		'numOfRatings': 0,
		'feedbackOpions': fakeCourseFeedbackOptions,
	}
];

/**
 * @returns {Array} Array of fake courses
 */
function getFakeCourses() {
	return courses;
}

/**
 * @param {Number} creatorId 
 * @returns {Array} Array of fake courses created by the creator with the given id
 */
function getFakeCoursesByCreator(creatorId) {
	const res = courses.filter(course => course.creator.includes(creatorId));
	return res;
}

module.exports = { getFakeCourses, getFakeCoursesByCreator };