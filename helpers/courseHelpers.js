const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { ExerciseModel } = require('../models/Exercises'); 
const { LectureModel } = require('../models/Lectures');

const errorCodes = require('./errorCodes');
const { assert } = require('./error');

function createExersiceObject(exercise, parentSection) {
	const { title, onWrongFeedback, question, answers } = exercise;
	const formattedAnswers = answers.map(answer => ({
		text: answer.text,
		correct: answer.correct,
		feedback: answer.feedback,
		dateUpdated: Date.now()
	}));

	return new ExerciseModel({
		title: title,
		question: question,
		onWrongFeedback: onWrongFeedback,
		answers: formattedAnswers,
		parentSection: parentSection,
		dateCreated: Date.now(),
		dateUpdated: Date.now()
	});
}

function createLectureObject(lecture, parentSection) {
	const { title, description, contentType, content } = lecture;
	return new LectureModel({
		title: title,
		description: description,
		contentType: contentType,
		content: content,
		parentSection: parentSection,
		dateCreated: Date.now(),
		dateUpdated: Date.now()
	});
}


//this creates an array of full object components
//we only need to pass on compType and id
function createComponents(components, parentSection) {
	let componentsArray = [];

	components.forEach(component => {
		if (component.compType === 'exercise') {
			const exerciseObject = createExersiceObject(component, parentSection);
			componentsArray.push(exerciseObject);
		} else if (component.compType === 'lecture') {
			const lectureObject = createLectureObject(component, parentSection);
			componentsArray.push(lectureObject);
		}
	});

	return componentsArray;	
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

	sectionObject.components = createComponents(components, sectionId);
	
	return sectionObject;
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


	let sectionsObjects = [];
	sections.forEach(
		section => {
			const sectionObject = createSection(section, courseId);
			sectionsObjects.push(sectionObject);
		});
	
	courseObject.sections = sectionsObjects;
	
	return courseObject;
}

async function saveComponents(component) {
	if (component.compType === 'lecture') {
		await component.save();
	} else if (component.compType === 'exercise') {
		await component.save();
	}
}

async function saveSections(section) {
	await section.save();
	for (const component of section.components) {
		await saveComponents(component);
	}
}

async function saveFullCourse(course) {
	await course.save();
	for (const section of course.sections) {
		await saveSections(section);
	}
}

module.exports = {
	createCourseObject,
	createCourse,
	saveFullCourse,
};