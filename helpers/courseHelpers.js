const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { ExerciseModel } = require('../models/Sections'); 
const { LectureModel } = require('../models/Sections');

const errorCodes = require('./errorCodes');
const { assert } = require('./error');



function createComponents(components, parentSection) {
	return [];	
}


function createSectionObject(title, description, parentCourse) {
	return new SectionModel({
		title: title,
		description: description,
		parentCourse: parentCourse,
		dateCreated: Date.now(),
		dateUpdated: Date.now()
	});
}

function createSection(section, parentCourse) {
	const { title, description, components} = section;
	
	const sectionObject = createSectionObject(title, description, parentCourse);
	const sectionId = sectionObject._id;

	sectionObject.components = createComponents(components);
	
	return [];
}

function createCourseObject(courseInfo) {	
	const {title, category, difficulty, description, coverImg, status } = courseInfo;
	
	return new CourseModel({
		title: title, 
		category: category,
		difficulty: difficulty,
		description: description,
		coverImg: coverImg,
		status: status,
		dateCreated: Date.now(),
		dateUpdated: Date.now()
	});
}

function createCourse(courseInfo, sections = []) {
	const courseObject = createCourseObject(courseInfo);
	const courseId = courseObject._id;


	let sectionsObject = [];
	if(length(sections > 0)){
		sections.forEach(
			section => {
				const sectionObject = createSection(section, courseId);
				sectionsObject.push(sectionObject);
			});
	}

	console.log(courseObject._id);
	
	return courseObject;
}


module.exports = {
	createCourseObject,
	createCourse,
};