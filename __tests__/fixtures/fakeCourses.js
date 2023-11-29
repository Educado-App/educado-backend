const courses = [
	{
		'title': 'fakeCourse1',
		'description': 'fakeCourse1 description',
		'dateCreated': new Date().toJSON(),
		'dateUpdated': new Date().toJSON(),
		'category': 'mathematics',
		'published': false,
		'sections': [],
		'creator': [],
		'difficulty': 1,
		'estimatedHours': 1,
		'rating': 5,
	},
	{
		'title': 'fakeCourse2',
		'description': 'fakeCourse2 description',
		'dateCreated': new Date().toJSON(),
		'dateUpdated': new Date().toJSON(),
		'category': 'language',
		'published': false,
		'sections': [],
		'creator': ['1234567891011'],
		'difficulty': 1,
		'estimatedHours': 1,
		'rating': 5,
	},
	{
		'title': 'fakeCourse3',
		'description': 'fakeCourse3 description',
		'dateCreated': new Date().toJSON(),
		'dateUpdated': new Date().toJSON(),
		'category': 'programming',
		'published': true,
		'sections': [],
		'creator': [],
		'difficulty': 2,
		'estimatedHours': 3,
		'rating': 5,
	},
	{
		'title': 'fakeCourse4',
		'description': 'fakeCourse4 description',
		'dateCreated': new Date().toJSON(),
		'dateUpdated': new Date().toJSON(),
		'category': 'music',
		'published': true,
		'sections': [],
		'creator': ['1234567891011'],
		'difficulty': 6,
		'estimatedHours': 2,
		'rating': 3,
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