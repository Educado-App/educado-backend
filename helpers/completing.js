const { StudentModel } = require('../models/Students');
const { SectionModel } = require('../models/Sections');
const { ExerciseModel } = require('../models/Exercises');
const { LectureModel } = require('../models/Lecture');
const errorCodes = require('./errorCodes');
const mongoose = require('mongoose');

const COMP_TYPES = {
    LECTURE: 'lecture',
    EXERCISE: 'exercise'
}

async function markAsCompleted(student, comp, points, isComplete) {
  const sectionId = mongoose.Types.ObjectId(comp.parentSection.toString());
  const section = await SectionModel.findById(sectionId);

  if (!section) {
    return undefined;
  }

  const courseId = mongoose.Types.ObjectId(section.parentCourse.toString());

  const courseStudent = findCourse(student, courseId);

  const sectionStudent = findSection(courseStudent, sectionId);

  const componentStudent = findComp(sectionStudent, comp._id);

  const obj = markComponentAsCompleted(courseStudent, sectionStudent, componentStudent, student, points, isComplete);

  obj.section = markSectionAsCompleted(obj.section, isComplete);
  obj.course = markCourseAsCompleted(obj.course, isComplete);

  const index = obj.student.courses.findIndex(course => course.courseId.toString() === courseId.toString());

  if (index >= 0) {
    obj.student.courses[index] = obj.course;

    student = await updateUserLevel(obj.student);

    await StudentModel.findByIdAndUpdate(
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

    return student;
  }

  return undefined;
}

function markComponentAsCompleted(course, section, component, student, points, isComplete) {
  if (!component) {
    return undefined;
  }

  if (component.compType === COMP_TYPES.EXERCISE) {
    component.pointsGiven = points;
    component.isFirstAttempt = false;

    // update the section's, course's and student's points
    section.totalPoints += points;
    course.totalPoints += points;
    student.points += points;
  }

  if (!component.isComplete) {
    component.isComplete = isComplete;
  }

  if (isComplete) {
    component.completionDate = Date.now();
  }

  return {
    course,
    section,
    student,
    component,
  };
}

function markSectionAsCompleted(section, isComplete) {
  if (isComplete) {
    const anyComponentIncomplete = section.components.some(component => !component.isComplete);

    if (!anyComponentIncomplete) {
      section.isComplete = true;
      section.completionDate = Date.now();
    }
  }
  return section;
}

function markCourseAsCompleted(course, isComplete) {
  if (isComplete) {
    const anySectionIncomplete = course.sections.some(section => !section.isComplete);

    if (!anySectionIncomplete) {
      course.isComplete = true;
      course.completionDate = Date.now();
    }
  }
  return course;
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
      return res.status(404).json({ error: errorCodes['E0006'] });
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
