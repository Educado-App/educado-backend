const { CourseModel } = require('../models/Courses');
const { SectionModel } = require('../models/Sections');
const { ExerciseModel } = require('../models/Exercises'); 
const { LectureModel } = require('../models/Lectures');
const { uploadFileToBucket, deleteFileFromBucket} = require('./bucketUtils');

const errorCodes = require('./errorCodes');
const { assert, CustomError } = require('./error');


const componentModels = {
	exercise: ExerciseModel,
	lecture: LectureModel,
};

async function handleMedia(media) {
	if (!media || !media.file) {
		console.log('No media or file to handle');
		throw new Error(`${errorCodes.E1406}: No media or file to handle`);
	}

	if (media.file.mimetype !== 'text/plain') {
		const mediaString = `${media.id}_${media.parentType}`;
		const file = media.file;

		try {
			await uploadFileToBucket(file, mediaString); //upload new media
		} catch (error) {
			throw new Error(`${errorCodes.E1406}: error uploading media to service`);
		}
	}
}

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

function createCourseObject(courseInfo, creator) {
	const { title, category, difficulty, description, coverImg, status } = courseInfo;

	const courseObject = new CourseModel({
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

	coverImg.id = courseObject._id;
	handleMedia(coverImg);
	const coverImgString = `${courseObject._id}_${coverImg.parentType}`;
	courseObject.coverImg = coverImgString;

	return courseObject;
}

async function createAndSaveExercise(component, parentSection) {
	
	const exerciseObject = createExersiceObject(component.component, parentSection);
	
	const componentInfo = {
		compType: component.compType,
		compId: exerciseObject._id
	};

	const savedExercise = await exerciseObject.save();
	assert(savedExercise, errorCodes.E1405);

	return componentInfo;
}

async function createAndSaveLecture(component, parentSection){
	const lectureObject = createLectureObject(component.component, parentSection);
			
	const componentInfo = {
		compType: component.compType,
		compId: lectureObject._id
	};

	const savedLecture = await lectureObject.save();
	assert(savedLecture, errorCodes.E1404);

	return componentInfo;
}

async function createAndSaveComponent(component, parentSection){
	let componentInfo;
	if (component.compType === 'exercise') {
		componentInfo = await createAndSaveExercise(component, parentSection);
	} else if (component.compType === 'lecture') {
		componentInfo = await createAndSaveLecture(component, parentSection);
		if (component.video) {
			component.video.id = componentInfo.compId;
			await handleMedia(component.video);
		}
	}

	return componentInfo;
}


// This creates an array of full object components
// We only need to pass on compType and id
async function createAndSaveAllComponents(components, parentSection) {
	let componentsArray = [];

	await Promise.all(components.map(async component => {
		const componentInfo = await createAndSaveComponent(component, parentSection);
		componentsArray.push(componentInfo);
	}));

	return componentsArray;	
}


async function createAndSaveSection(section, parentCourse) {
	const { title, description, components } = section;
	
	const sectionObject = createSectionObject(title, description, parentCourse);

	const sectionId = sectionObject._id;
	sectionObject.components = await createAndSaveAllComponents(components, sectionId);

	const savedSection = await sectionObject.save();

	return savedSection;
}


async function createAndSaveCourse(courseInfo, sections = [], creator) {
	const courseObject = createCourseObject(courseInfo, creator);
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


function updateCourseObject(courseInfo) {
	const {title, category, difficulty, description, status, coverImg } = courseInfo;

	const update = {
		title: title,
		category: category,
		difficulty: difficulty,
		description: description,
		status: status,
		coverImg: coverImg,
		dateUpdated: Date.now(),
	};

	handleMedia(coverImg);
	const coverImgString = `${coverImg.id}_${coverImg.parentType}`;
	update.coverImg = coverImgString;

	return update;
}

function updateSectionObject(title, description) {
	const update = {
		title: title,
		description: description,
		dateUpdated: Date.now(),
	};

	return update;
}


async function updateAndSaveExercise(exercise) {
	const { title, onWrongFeedback, question, answers, _id } = exercise;

	const update = {
		title: title,
		onWrongFeedback: onWrongFeedback,
		question: question, 
		answers: answers,
		dateUpdated: Date.now(),
	};

	const updatedExercise = await ExerciseModel.findByIdAndUpdate(_id, update, {
		new: true
	});
	assert(updatedExercise, errorCodes.E1409);

	const componentInfo = {
		compType: 'exercise',
		compId: updatedExercise._id
	};

	return componentInfo;
}

async function updateAndSaveLecture(lecture){
	const { title, description, contentType, content, _id } = lecture.component;

	const update = {
		title: title,
		description: description,
		contentType: contentType,
		content: content,
		dateUpdated: Date.now(),
	};

	const updatedLecture = await LectureModel.findByIdAndUpdate(_id, update, {
		new: true
	});
	assert(updatedLecture, errorCodes.E1410);

	const componentInfo = {
		compType: 'lecture',
		compId: updatedLecture._id
	};

	return componentInfo;
}


async function deleteComponent(component) {
	const model = componentModels[component.compType];
	if (model) {
		await model.deleteOne({_id: component.compId});
	}
}

async function deleteRemovedComponents(componentsUpdate, oldComponents){
	try {
		await Promise.all(oldComponents.map(async component => {
			// If id was in old course, but not in update
			const isRemoved = !componentsUpdate.some(componentsUpdate => componentsUpdate.compId.toString() === component.compId.toString());
			if (isRemoved) {
				if (component.video) {
					await deleteFileFromBucket(`${component.compId}_v`).then(() => console.log('Video deleted')).catch(e => console.error(e.message));
				}
				await deleteComponent(component);
			}
		}));
	} catch (e) {
		console.error(e.message);
		throw CustomError(errorCodes.E1408);
	}
}

async function updateAndSaveComponent(component){
	let componentInfo;
	if (component.compType === 'exercise') {
		componentInfo = await updateAndSaveExercise(component);
	} else if (component.compType === 'lecture') {
		componentInfo = await updateAndSaveLecture(component);
		if (component.video) {
			component.video.id = componentInfo.compId;
			await handleMedia(component.video);
		}
	}

	return componentInfo;
}


async function deleteRemovedSections(sections, oldSections) {
	try {
		await Promise.all(oldSections.map(async oldSection => {
			if(!sections.some(section => section.toString() === oldSection.toString())) {
				await ExerciseModel.deleteMany({parentSection: oldSection});
				await LectureModel.deleteMany({parentSection: oldSection});

				await SectionModel.deleteOne({_id: oldSection});
			}
		}));
	} catch(e) {
		console.error(e.message);
		throw new CustomError(errorCodes.E1407);
	}
}


async function updateAndSaveAllComponents(components, oldSection) {
	const sectionId = oldSection._id;
	const oldComponents = oldSection.components;

	let componentsUpdate = [];

	await Promise.all(components.map(async component => {
		let componentObject;

		if (oldComponents.some(oldComponent => oldComponent.compId.toString() === component.component._id.toString())) {
			// Update
			componentObject = await updateAndSaveComponent(component, sectionId);
			
		} else{
			// Create
			componentObject = await createAndSaveComponent(component, sectionId);			
		}
		
		componentsUpdate.push(componentObject);
	}));
		
	await deleteRemovedComponents(componentsUpdate, oldComponents);
	
	return componentsUpdate;
	
}

async function updateAndSaveSection(section, oldSection){

	const { title, description, components, _id } = section;
	
	const update = updateSectionObject(title, description);
	
	const updatedComponents = await updateAndSaveAllComponents(components, oldSection);
	
	update.components = updatedComponents;

	const updatedSection = await SectionModel.findByIdAndUpdate(_id, update, {
		new: true
	});
	assert(updatedSection, errorCodes.E1411);
	
	return updatedSection;
}

async function updateAndSaveAllSections(sections, oldSections, courseId) {
	let sectionsUpdate = [];
	
	await Promise.all(sections.map(async section => {
		const sectionId = section._id;
		let sectionObject;
	
		if (oldSections.includes(section._id)) {
			// Update
			const oldSection = await SectionModel.findOne({ _id: sectionId });
			assert(oldSection, errorCodes.E1413);

			sectionObject = await updateAndSaveSection(section, oldSection);
		} else {
			sectionObject = await createAndSaveSection(section, courseId);
		}
		
		sectionsUpdate.push(sectionObject._id);
	}));

	await deleteRemovedSections(sectionsUpdate, oldSections);

	return sectionsUpdate;
}

async function updateAndSaveCourse(courseInfo, sections, baseCourse) {
	const courseId = baseCourse._id;
	const oldSections = baseCourse.sections;

	const updatedCourseInfo = updateCourseObject(courseInfo);

	const updatedSections = await updateAndSaveAllSections(sections, oldSections);

	updatedCourseInfo.sections = updatedSections;

	const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, updatedCourseInfo, {
		new: true
	});
	assert(updatedCourse, errorCodes.E1401);

	return updatedCourse;
}

module.exports = {
	createAndSaveCourse,
	updateAndSaveCourse,
};