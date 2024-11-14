const { StudentModel } = require('../models/Students');
const { SectionModel } = require('../models/Sections');
const { CourseModel } = require('../models/Courses');
const mongoose = require('mongoose');

const COMP_TYPES = {
	LECTURE: 'lecture',
	EXERCISE: 'exercise'
};

async function markAsCompleted(student, comp, isComplete) {
	try {
		const sectionId = mongoose.Types.ObjectId(comp.parentSection.toString());
		const section = await SectionModel.findById(sectionId);
		if (!section) {
			return undefined;
		}

		const courseId = mongoose.Types.ObjectId(section.parentCourse.toString());
		const course = await CourseModel.findById(courseId);
		if (!course) {
			return undefined;
		}

		const courseStudent = findCourse(student, courseId);
		const sectionStudent = findSection(courseStudent, sectionId);
		const componentStudent = findComp(sectionStudent, comp._id);

		const obj = await markComponentAsCompleted(course, courseStudent, sectionStudent, componentStudent, student, isComplete);
		obj.section = await markSectionAsCompleted(course, student, obj.section, isComplete);
		obj.course = await markCourseAsCompleted(course, obj.course, student, isComplete);

		const index = obj.student.courses.findIndex(course => course.courseId.toString() === courseId.toString());
		if (index >= 0) {
			obj.student.courses[index] = obj.course;
			student = await updateUserLevel(obj.student);
			const updatedStudent = await StudentModel.findByIdAndUpdate(
				{ _id: student._id },
				{
					$set: {
						courses: student.courses,
						level: student.level,
						points: student.points
					}
				},
				{ new: true }
			);
			return updatedStudent;
		}
		return undefined;
	} catch (error) {
		console.error('Error in markAsCompleted:', error);
		throw error;
	}
}

async function markComponentAsCompleted(course, courseStudent, sectionStudent, componentStudent, student, isComplete) {
	if (!componentStudent) {
		return undefined;
	}

	if (componentStudent.compType === COMP_TYPES.EXERCISE && isComplete) {
		// Only award points if this is the first time completing
		if (!componentStudent.isComplete) {
			const pointsToAward = componentStudent.isFirstAttempt ? 
				course.pointsConfig.exerciseCompletion + course.pointsConfig.firstAttemptBonus :
				course.pointsConfig.exerciseCompletion;

			sectionStudent.totalPoints += pointsToAward;
			courseStudent.totalPoints += pointsToAward;
			student.points += pointsToAward;
			componentStudent.pointsGiven = pointsToAward;
		}
	}

	if (!componentStudent.isComplete) {
		componentStudent.isComplete = isComplete;
	}

	if (isComplete) {
		componentStudent.completionDate = Date.now();
	}

	return {
		course: courseStudent,
		section: sectionStudent,
		student,
		component: componentStudent,
	};
}

async function markSectionAsCompleted(course, student, section, isComplete) {
	if (isComplete) {
		const anyComponentIncomplete = section.components.some(component => !component.isComplete);
		if (!anyComponentIncomplete && !section.isComplete) {
			section.isComplete = true;
			section.completionDate = Date.now();
			// Award section completion points
			section.extraPoints = course.pointsConfig.sectionCompletion;
			student.points += course.pointsConfig.sectionCompletion;
		}
	}
	return section;
}

async function markCourseAsCompleted(course, courseStudent, student, isComplete) {
	if (isComplete) {
		const anySectionIncomplete = courseStudent.sections.some(section => !section.isComplete);
		if (!anySectionIncomplete && !courseStudent.isComplete) {
			courseStudent.isComplete = true;
			courseStudent.completionDate = Date.now();
			// Award course completion points
			student.points += course.pointsConfig.courseCompletion;
		}
	}
	return courseStudent;
}

function findCourse(student, courseId) {
	const foundCourse = student.courses.find(course => course.courseId.toString() === courseId.toString());

	if (foundCourse) {
		return foundCourse;
	}
	return undefined;
}

function findSection(course, sectionId) {
	const foundSection = course.sections.find(section => section.sectionId.toString() === sectionId.toString());

	if (foundSection) {
		return foundSection;
	}
	return undefined;
}

function findComp(section, compId) {
	const foundComp = section.components.find(component => component.compId.toString() === compId.toString());

	if (foundComp) {
		return foundComp;
	}
	return undefined;
}

async function addIncompleteCourse(course) {
	let obj = {
		courseId: course._id,
		totalPoints: 0,
		isComplete: false,
		sections: []
	};

	for (let sectionId of course.sections) {
		let section = {
			sectionId: sectionId,
			totalPoints: 0,
			extraPoints: 0,
			isComplete: false,
			components: []
		};


		const courseSection = await SectionModel.findById(sectionId);
		if (!courseSection) {
			throw new Error('Section not found');
		}

		for (let comp of courseSection.components) {
			section.components.push({
				compId: comp.compId,
				compType: comp.compType,
				isComplete: false,
				pointsGiven: 0,
				isFirstAttempt: true,
			});
		}

		obj.sections.push(section);
	}

	return obj;
}

function updateUserLevel(student) {
	// 100 points per level to level up
	const pointsToNextLevel = student.level * 100; 
	if (student.points >= pointsToNextLevel) {
		student.level++;
	}

	return student;
}

module.exports = {
	markAsCompleted,
	addIncompleteCourse,
	findComp,
	findSection,
	findCourse,
	markComponentAsCompleted,
	markSectionAsCompleted,
	markCourseAsCompleted,
	updateUserLevel
};