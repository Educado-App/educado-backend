const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections') 
const { ExerciseModel } = require('../models/Sections') 
const { LectureModel } = require('../models/Sections') 

function createCourseObject(courseInfo) {	
	const {title, category, difficulty, description, coverImg } = courseInfo;

	return new CourseModel({
		title: title, 
		category: category,
		difficulty: difficulty,
		description: description,
		coverImg: coverImg,
		dateCreated: Date.now(),
		dateUpdated: Date.now()
	});
}

function createSections(sections) {
	return [];
}

module.exports = (
	createCourseObject,
	createSections
);