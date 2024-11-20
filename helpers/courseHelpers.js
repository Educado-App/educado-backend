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

function createSectionObject(title, description, parentCourse) {
	return new SectionModel({
		title: title,
		description: description,
		parentCourse: parentCourse,
		totalPoints: 0,
		dateCreated: Date.now(),
		dateUpdated: Date.now()
	});
}

function createCourseObject(courseInfo) {
	const {title, category, difficulty, description, coverImg, status, creator } = courseInfo;
	
	return new CourseModel({
		title: title, 
		category: category,
		difficulty: difficulty,
		description: description,
		coverImg: coverImg,
		status: status,
		creator: creator,
		dateCreated: Date.now(),
		dateUpdated: Date.now()
	});
}

//this creates an array of full object components
//we only need to pass on compType and id
async function createAndSaveComponents(components, parentSection) {
	let componentsArray = [];

	await Promise.all(components.map(async component => {
		let componentInfo = {};
		
		if (component.compType === 'exercise') {
			const exerciseObject = createExersiceObject(component.component, parentSection);
			
			componentInfo = {
				compType: component.compType,
				compId: exerciseObject._id
			};

			const savedExercise = await exerciseObject.save();

		} else if (component.compType === 'lecture') {
			const lectureObject = createLectureObject(component.component, parentSection);
			
			componentInfo = {
				compType: component.compType,
				compId: lectureObject._id
			};

			const savedLecture = await lectureObject.save();
		}

		componentsArray.push(componentInfo);
	}));

	return componentsArray;	
}



async function createAndSaveSection(section, parentCourse) {
	const { title, description, components} = section;
	
	const sectionObject = createSectionObject(title, description, parentCourse);

	const sectionId = sectionObject._id;
	sectionObject.components = createAndSaveComponents(components, sectionId);

	const savedSection = await sectionObject.save();

	return savedSection;
}


async function createAndSaveCourse(courseInfo, sections = []) {
	const courseObject = createCourseObject(courseInfo);
	const courseId = courseObject._id;


	let sectionsArray = [];
	await Promise.all(sections.map(async section => {
		const sectionObject = await createAndSaveSection(section, courseId);
		sectionsArray.push(sectionObject._id);
	}));
	
	courseObject.sections = sectionsArray;

	const savedCourse = await courseObject.save();
	
	return savedCourse;
}

module.exports = {
	createAndSaveCourse,
};