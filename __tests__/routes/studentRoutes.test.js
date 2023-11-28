const express = require('express');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const app = express();
const request = require('supertest');
const router = require('../../routes/studentRoutes');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeStudent = require('../fixtures/fakeStudent');
const makeFakeSection = require('../fixtures/fakeSection');
const makeFakeExercise = require('../fixtures/fakeExercise');
const makeFakeLecture = require('../fixtures/fakeLecture');
const makeFakeStudentCourse = require('../fixtures/fakeStudentCourse');
const completing = require('../../helpers/completing');

const { signAccessToken } = require('../../helpers/token');

app.use(express.json());
app.use('/api/students', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5023; // Choose a port for testing
const server = app.listen(PORT);

let db;
let fakeStudent;
let fakeCourse = makeFakeCourse();
let fakeSection = makeFakeSection();
let fakeExercise = makeFakeExercise();
let fakeLecture = makeFakeLecture();
let fakeStudentCourse = makeFakeStudentCourse();
const userId = mongoose.Types.ObjectId('5f841c2b1c8cfb2c58b78d68');
let token;

const COMP_TYPES = {
	LECTURE: 'lecture',
	EXERCISE: 'exercise'
};

jest.mock('../../middlewares/requireLogin', () => {
	return (req, res, next) => {
		next();
	};
});

// Mock token secret
jest.mock('../../config/keys', () => {
	return {
		TOKEN_SECRET: 'test',
	};
});

beforeAll(async () => {
	db = await connectDb(); // Connect to the database
	db.collection('courses').insertOne(fakeCourse);
	token = signAccessToken({ id: userId });
});

beforeEach(async () => {
	// Insert the fake user into the database before each test

	fakeStudent = makeFakeStudent(userId);
	await db.collection('students').insertOne(fakeStudent);
});

/** SUBSCRIPTIONS **/

/*describe('GET /students', () => {

  it('should check if a user is subscribed to a specific course and return true', async () => {
    const course = await db.collection('courses').findOne({ title: 'test course' });
    const courseId = course._id;

    const user = await db.collection('students').findOne({ email: 'fake@gmail.com' });
    const userId = user._id;

    // Find the user and update their subscriptions
    const result = await db.collection('students').findOneAndUpdate(
      { _id: userId }, // Convert userId to ObjectId if needed
      { $push: { subscriptions: courseId } },
      { returnDocument: 'after' } // 'after' returns the updated document
    )

    const updatedUser = result.value;

    // Check if the subscription was successfully added
    expect(updatedUser.subscriptions.find((element) => element == courseId));

    const response = await request(`http://localhost:${PORT}`)
      .get('/api/students/subscriptions?user_id=' + userId + '&course_id=' + courseId);

    expect(response.status).toBe(200);
    expect(response.text).toBe('true');
  });

  it('should return false if a user is not subscribed to a specific course', async () => {

    const course = await db.collection('courses').findOne({ title: 'test course' });
    const courseId = course._id;

    const user = await db.collection('students').findOne({ email: 'fake@gmail.com' });
    const userId = user._id;

    const response = await request(`http://localhost:${PORT}`)
      .get('/api/students/subscriptions?user_id=' + userId + '&course_id=' + courseId);

    expect(response.status).toBe(200);
    expect(response.text).toBe('false');

  });

  /*it('should handle user not found error', async () => {

    const course = await db.collection('courses').findOne({ title: 'test course' });
    const courseId = course._id;

    // create non existing userId
    const ObjectId = mongoose.Types.ObjectId;
    const userId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

    // simulate a request for a non-existent user
    const response = await request(`http://localhost:${PORT}`)
      .get('/api/students/subscriptions?user_id=' + userId + '&course_id=' + courseId);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('E0004');
  });


  it('should handle invalid user id', async () => {

    const course = await db.collection('courses').findOne({ title: 'test course' });
    const courseId = course._id;

    // simulate a request with invalid user id
    const response = await request(`http://localhost:${PORT}`)
      .get('/api/students/subscriptions?user_id=this-is-an-invalid-userId&course_id=' + courseId);

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('E0003');
  });

  it('should handle course not found error', async () => {

    const user = await db.collection('students').findOne({ email: 'fake@gmail.com' });
    const userId = user._id;

    // create non existing courseId
    const ObjectId = mongoose.Types.ObjectId;
    const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

    // simulate a request for a non-existent course
    const response = await request(`http://localhost:${PORT}`)
      .get('/api/students/subscriptions?user_id=' + userId + '&course_id=' + courseId);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('E0006');
  });


  it('should handle invalid course id', async () => {

    const user = await db.collection('students').findOne({ email: 'fake@gmail.com' });
    const userId = user._id;

    // simulate a request with invalid course id
    const response = await request(`http://localhost:${PORT}`)
      .get('/api/students/subscriptions?user_id=' + userId + '&course_id=this-is-an-invalid-courseId');


    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('E0003');
  });

});*/

describe('GET /students/:userId/subscriptions', () => {
	it('Should get user subscriptions', async () => {

		const courseId = '651d3a15cda7d5bd2878dfc7';
		await db.collection('users').findOne({ email: 'fake@gmail.com' });

		// Find the user and update their subscriptions
		await db.collection('students').findOneAndUpdate(
			{ baseUser: userId }, // Convert userId to ObjectId if needed
			{ $push: { subscriptions: courseId } },
			{ returnDocument: 'after' } // 'after' returns the updated document
		);

		const updatedUser = await db.collection('students').findOne({ email: fakeStudent.email });

		// Check if the subscription was successfully added
		expect(updatedUser.subscriptions.find((element) => element == courseId));

		const response = await request(`http://localhost:${PORT}`)
			.get('/api/students/' + userId + '/subscriptions');

		expect(response.status).toBe(200);
		expect(response.body).toBeInstanceOf(Array);
		expect(response.body.find((element) => element == courseId));
	});

	it('Should handle user not found error', async () => {

		// create non existing userId
		const ObjectId = mongoose.Types.ObjectId;
		const userId = new ObjectId('5f841c2a1c8cfb2c52b78d68');

		// simulate a request for a non-existent user
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/students/' + userId + '/subscriptions');

		expect(response.status).toBe(400);
		expect(response.body.error.code).toBe('E0004');
	});


	it('Should handle invalid user id', async () => {

		// simulate a request with invalid user id
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/students/this-is-an-invalid-userId/subscriptions');

		expect(response.status).toBe(400);
		expect(response.body.error.code).toBe('E0014');
	});
});

describe('PATCH /api/students/:userId/complete', () => { 
	beforeEach(async () => {
		fakeCourse = makeFakeCourse();
		fakeSection = makeFakeSection();
		fakeExercise = makeFakeExercise();
		fakeLecture = makeFakeLecture();

		await db.collection('courses').insertOne(fakeCourse);
		await db.collection('sections').insertOne(fakeSection);
		await db.collection('exercises').insertOne(fakeExercise);
		await db.collection('lectures').insertOne(fakeLecture);

		fakeSection.parentCourse = fakeCourse._id;
		fakeExercise.parentSection = fakeSection._id;
		fakeLecture.parentSection = fakeSection._id;

		fakeCourse.sections.push(fakeSection._id);
		fakeSection.components.push({ compId: fakeExercise._id, compType: COMP_TYPES.EXERCISE });
		fakeSection.components.push({ compId: fakeLecture._id, compType: COMP_TYPES.LECTURE });

		fakeStudentCourse = makeFakeStudentCourse(fakeCourse._id, fakeSection._id, fakeLecture._id, fakeExercise._id);
		fakeStudent.courses.push(fakeStudentCourse);
    
		await db.collection('courses').updateOne({ _id: fakeCourse._id }, { $set: fakeCourse });
		await db.collection('sections').updateOne({ _id: fakeSection._id }, { $set: fakeSection });
		await db.collection('exercises').updateOne({ _id: fakeExercise._id }, { $set: fakeExercise });
		await db.collection('lectures').updateOne({ _id: fakeLecture._id }, { $set: fakeLecture });
		await db.collection('students').updateOne({ baseUser: userId }, { $set: fakeStudent });
	});


	afterEach(async () => {
		await db.collection('students').deleteOne({ baseUser: userId });
		await db.collection('courses').deleteOne({ _id: fakeCourse._id });
		await db.collection('sections').deleteOne({ _id: fakeSection._id });
		await db.collection('exercises').deleteOne({ _id: fakeExercise._id });
		await db.collection('lectures').deleteOne({ _id: fakeLecture._id });
	});

	it('find course', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);

		expect(course).toEqual(fakeStudent.courses[0]);
		expect(course.courseId).toEqual(fakeCourse._id);
	});

	it('find section', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);

		expect(section).toEqual(fakeStudent.courses[0].sections[0]);
		expect(section.sectionId).toEqual(fakeSection._id);
	});

	it('find comp lecture', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, fakeLecture._id);

		expect(comp).toEqual(fakeStudent.courses[0].sections[0].components[0]);
		expect(comp.compId).toEqual(fakeLecture._id);
	});

	it('find comp exercise', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, fakeExercise._id);

		expect(comp).toEqual(fakeStudent.courses[0].sections[0].components[1]);
		expect(comp.compId).toEqual(fakeExercise._id);
	});

	it('find course - should fail', () => {
		const nonExistingCourseId = 'nonExistingCourseId';
		const course = completing.findCourse(fakeStudent, nonExistingCourseId);

		expect(course).toBeUndefined();
	});

	it('find section - should fail', () => {
		const nonExistingSectionId = 'nonExistingSectionId';
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, nonExistingSectionId);

		expect(section).toBeUndefined();
	});

	it('find comp lecture - should fail', () => {
		const nonExistingLectureId = 'nonExistingLectureId';
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, nonExistingLectureId);

		expect(comp).toBeUndefined();
	});

	it('find comp exercise - should fail', () => {
		const nonExistingExerciseId = 'nonExistingExerciseId';
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, nonExistingExerciseId);

		expect(comp).toBeUndefined();
	});

	it('marks lecture as complete', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, fakeLecture._id);

		const points = 0, isComplete = true;

		expect(comp.isComplete).toBe(false);

		const obj = completing.markComponentAsCompleted(course, section, comp, fakeStudent, points, isComplete);

		expect(obj.component.isComplete).toBe(true);
		expect(obj.component.pointsGiven).toBe(0);
		expect(obj.component.completionDate).not.toBeUndefined();
	});

	it('marks lecture as complete already', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, fakeLecture._id);

		comp.isComplete = true;

		const points = 0, isComplete = true;

		expect(comp.isComplete).toBe(true);

		const obj = completing.markComponentAsCompleted(course, section, comp, fakeStudent, points, isComplete);

		expect(obj.component.isComplete).toBe(true);
		expect(obj.component.pointsGiven).toBe(0);
		expect(obj.component.completionDate).not.toBeUndefined();
	});

	it('marks exercise as complete first attempt', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, fakeExercise._id);

		const points = 10, isComplete = true;

		expect(comp.isComplete).toBe(false);
		expect(comp.isFirstAttempt).toBe(true);
		expect(comp.pointsGiven).toBe(0);
		expect(course.totalPoints).toBe(0);
		expect(section.totalPoints).toBe(0);
		expect(fakeStudent.points).toBe(0);

		const obj = completing.markComponentAsCompleted(course, section, comp, fakeStudent, points, isComplete);

		expect(obj.component.isComplete).toBe(true);
		expect(obj.component.pointsGiven).toBe(10);
		expect(obj.component.isFirstAttempt).toBe(false);
		expect(obj.component.completionDate).not.toBeUndefined();
		expect(obj.course.totalPoints).toBe(10);
		expect(obj.section.totalPoints).toBe(10);
		expect(obj.student.points).toBe(10);
	});

	it('marks exercise as complete not first attempt', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, fakeExercise._id);

		const points = 5, isComplete = true;

		comp.isFirstAttempt = false;

		expect(comp.isComplete).toBe(false);
		expect(comp.isFirstAttempt).toBe(false);
		expect(comp.pointsGiven).toBe(0);
		expect(course.totalPoints).toBe(0);
		expect(section.totalPoints).toBe(0);
		expect(fakeStudent.points).toBe(0);

		const obj = completing.markComponentAsCompleted(course, section, comp, fakeStudent, points, isComplete);

		expect(obj.component.isComplete).toBe(true);
		expect(obj.component.pointsGiven).toBe(5);
		expect(obj.component.isFirstAttempt).toBe(false);
		expect(obj.component.completionDate).not.toBeUndefined();
		expect(obj.course.totalPoints).toBe(5);
		expect(obj.section.totalPoints).toBe(5);
		expect(obj.student.points).toBe(5);
	});

	it('marks exercise as not complete (answered wrong)', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const comp = completing.findComp(section, fakeExercise._id);

		const points = 0, isComplete = false;

		comp.isFirstAttempt = false;

		expect(comp.isComplete).toBe(false);
		expect(comp.isFirstAttempt).toBe(false);
		expect(comp.pointsGiven).toBe(0);
		expect(course.totalPoints).toBe(0);
		expect(section.totalPoints).toBe(0);
		expect(fakeStudent.points).toBe(0);

		const obj = completing.markComponentAsCompleted(course, section, comp, fakeStudent, points, isComplete);

		expect(obj.component.isComplete).toBe(false);
		expect(obj.component.pointsGiven).toBe(0);
		expect(obj.component.isFirstAttempt).toBe(false);
		expect(obj.component.completionDate).not.toBeUndefined();
		expect(obj.course.totalPoints).toBe(0);
		expect(obj.section.totalPoints).toBe(0);
		expect(obj.student.points).toBe(0);
	});

	it('marks section complete when comps are completed', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const compExercise = completing.findComp(section, fakeExercise._id);
		const compLecture = completing.findComp(section, fakeLecture._id);

		const isComplete = true;

		expect(compExercise.isComplete).toBe(false);
		expect(compLecture.isComplete).toBe(false);

		const objExercise = completing.markComponentAsCompleted(course, section, compExercise, fakeStudent, 10, isComplete);

		expect(objExercise.component.isComplete).toBe(true);

		const objLecture = completing.markComponentAsCompleted(course, section, compLecture, fakeStudent, 0, isComplete);

		expect(objLecture.component.isComplete).toBe(true);

		const completedSection = completing.markSectionAsCompleted(fakeStudent, section, isComplete);

		expect(completedSection.isComplete).toBe(true);
		expect(completedSection.completionDate).not.toBeUndefined();
	});

	it('marks section extra points when comps are complete', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const compExercise = completing.findComp(section, fakeExercise._id);
		const compLecture = completing.findComp(section, fakeLecture._id);

		const isComplete = true;
		fakeStudent.currentExtraPoints = 20;

		expect(compExercise.isComplete).toBe(false);
		expect(compLecture.isComplete).toBe(false);
		expect(section.extraPoints).toBe(0);

		const objExercise = completing.markComponentAsCompleted(course, section, compExercise, fakeStudent, 10, isComplete);

		expect(objExercise.component.isComplete).toBe(true);

		const objLecture = completing.markComponentAsCompleted(course, section, compLecture, fakeStudent, 0, isComplete);

		expect(objLecture.component.isComplete).toBe(true);

		const completedSection = completing.markSectionAsCompleted(fakeStudent, section, isComplete);

		expect(completedSection.isComplete).toBe(true);
		expect(completedSection.extraPoints).toBe(20);
		expect(completedSection.completionDate).not.toBeUndefined();
	});

	it('dont give section extra points when comps are not complete', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const compExercise = completing.findComp(section, fakeExercise._id);
		const compLecture = completing.findComp(section, fakeLecture._id);

		const isComplete = false;
		fakeStudent.currentExtraPoints = 20;

		expect(compExercise.isComplete).toBe(false);
		expect(compLecture.isComplete).toBe(false);
		expect(section.extraPoints).toBe(0);

		const objExercise = completing.markComponentAsCompleted(course, section, compExercise, fakeStudent, 10, isComplete);

		expect(objExercise.component.isComplete).toBe(false);

		const objLecture = completing.markComponentAsCompleted(course, section, compLecture, fakeStudent, 0, isComplete);

		expect(objLecture.component.isComplete).toBe(false);

		const completedSection = completing.markSectionAsCompleted(fakeStudent, section, isComplete);

		expect(completedSection.isComplete).toBe(false);
		expect(completedSection.extraPoints).toBe(0);
	});

	it('marks section not complete when comps are not completed', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const compExercise = completing.findComp(section, fakeExercise._id);
		const compLecture = completing.findComp(section, fakeLecture._id);

		const isComplete = false;

		expect(compExercise.isComplete).toBe(false);
		expect(compLecture.isComplete).toBe(false);

		const objExercise = completing.markComponentAsCompleted(course, section, compExercise, fakeStudent, 10, isComplete);

		expect(objExercise.component.isComplete).toBe(false);

		const objLecture = completing.markComponentAsCompleted(course, section, compLecture, fakeStudent, 0, isComplete);

		expect(objLecture.component.isComplete).toBe(false);

		const completedSection = completing.markSectionAsCompleted(fakeStudent, section, isComplete);

		expect(completedSection.isComplete).toBe(false);
	});

	it('marks course complete when section is completed', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const compExercise = completing.findComp(section, fakeExercise._id);
		const compLecture = completing.findComp(section, fakeLecture._id);

		const isComplete = true;

		expect(compExercise.isComplete).toBe(false);
		expect(compLecture.isComplete).toBe(false);

		const objExercise = completing.markComponentAsCompleted(course, section, compExercise, fakeStudent, 10, isComplete);

		expect(objExercise.component.isComplete).toBe(true);

		const objLecture = completing.markComponentAsCompleted(course, section, compLecture, fakeStudent, 0, isComplete);

		expect(objLecture.component.isComplete).toBe(true);

		const completedSection = completing.markSectionAsCompleted(fakeStudent, section, isComplete);

		expect(completedSection.isComplete).toBe(true);
		expect(completedSection.completionDate).not.toBeUndefined();

		const completedCourse = completing.markCourseAsCompleted(course, isComplete);

		expect(completedCourse.isComplete).toBe(true);
		expect(completedCourse.completionDate).not.toBeUndefined();
	});

	it('marks course not complete when section is not completed', () => {
		const course = completing.findCourse(fakeStudent, fakeCourse._id);
		const section = completing.findSection(course, fakeSection._id);
		const compExercise = completing.findComp(section, fakeExercise._id);
		const compLecture = completing.findComp(section, fakeLecture._id);

		const isComplete = false;

		expect(compExercise.isComplete).toBe(false);
		expect(compLecture.isComplete).toBe(false);

		const objExercise = completing.markComponentAsCompleted(course, section, compExercise, fakeStudent, 10, isComplete);

		expect(objExercise.component.isComplete).toBe(false);

		const objLecture = completing.markComponentAsCompleted(course, section, compLecture, fakeStudent, 0, isComplete);

		expect(objLecture.component.isComplete).toBe(false);

		const completedSection = completing.markSectionAsCompleted(fakeStudent, section, isComplete);

		expect(completedSection.isComplete).toBe(false);

		const completedCourse = completing.markCourseAsCompleted(course, isComplete);

		expect(completedCourse.isComplete).toBe(false);
	});

	it('marks as completed in the db', async () => {
		fakeStudent.courses[0].totalPoints = 20;
		fakeStudent.courses[0].sections[0].totalPoints = 10;
		fakeStudent.points = 95;

		const student = await completing.markAsCompleted(fakeStudent, fakeExercise, 10, true);

		// expect the student 
		expect(student.courses[0].totalPoints).toBe(30);
		expect(student.courses[0].sections[0].totalPoints).toBe(20);
		expect(student.courses[0].sections[0].components[1].pointsGiven).toBe(10);
		expect(student.courses[0].sections[0].components[1].isComplete).toBe(true);
		expect(student.points).toBe(105);
		expect(student.level).toBe(2);

		const updatedStudent = await db.collection('students').findOne({ baseUser: userId });

		// expect the db
		expect(updatedStudent.courses[0].totalPoints).toBe(30);
		expect(updatedStudent.courses[0].sections[0].totalPoints).toBe(20);
		expect(updatedStudent.courses[0].sections[0].components[1].pointsGiven).toBe(10);
		expect(updatedStudent.courses[0].sections[0].components[1].isComplete).toBe(true);
		expect(updatedStudent.points).toBe(105);
		expect(updatedStudent.level).toBe(2);
	});

	it('level up student', () => {
		fakeStudent.points = 100;

		expect(fakeStudent.points).toBe(100);

		const student = completing.updateUserLevel(fakeStudent);

		expect(student.level).toBe(2);
		expect(student.points).toBe(100);
	});

	it('student doent level up', () => {
		fakeStudent.points = 50;

		expect(fakeStudent.points).toBe(50);

		const student = completing.updateUserLevel(fakeStudent);

		expect(student.level).toBe(1);
		expect(student.points).toBe(50);
	});

	it('route should return 200 with the updated student (exercise)', async () => {

		const response = await request(`http://localhost:${PORT}`)
			.patch('/api/students/' + userId + '/complete')
			.set('token', token)
			.send({ comp: fakeExercise, isComplete: true, points: 10 })
			.expect(200);

		const student = response.body;

		expect(student.courses[0].totalPoints).toBe(10);
		expect(student.courses[0].isComplete).toBe(false);
		expect(student.courses[0].sections[0].totalPoints).toBe(10);
		expect(student.courses[0].sections[0].isComplete).toBe(false);
		expect(student.courses[0].sections[0].components[1].pointsGiven).toBe(10);
		expect(student.courses[0].sections[0].components[1].isComplete).toBe(true);
		expect(student.points).toBe(10);
		expect(student.level).toBe(1);

		const updatedStudent = await db.collection('students').findOne({ baseUser: userId });

		expect(updatedStudent.courses[0].totalPoints).toBe(10);
		expect(updatedStudent.courses[0].isComplete).toBe(false);
		expect(updatedStudent.courses[0].sections[0].totalPoints).toBe(10);
		expect(updatedStudent.courses[0].sections[0].isComplete).toBe(false);
		expect(updatedStudent.courses[0].sections[0].components[1].pointsGiven).toBe(10);
		expect(updatedStudent.courses[0].sections[0].components[1].isComplete).toBe(true);
		expect(updatedStudent.points).toBe(10);
		expect(updatedStudent.level).toBe(1);
	});

	it('route should return 200 with the updated student (lecture)', async () => {

		const response = await request(`http://localhost:${PORT}`)
			.patch('/api/students/' + userId + '/complete')
			.set('token', token)
			.send({ comp: fakeLecture, isComplete: true, points: 0 })
			.expect(200);

		const student = response.body;

		expect(student.courses[0].totalPoints).toBe(0);
		expect(student.courses[0].isComplete).toBe(false);
		expect(student.courses[0].sections[0].totalPoints).toBe(0);
		expect(student.courses[0].sections[0].isComplete).toBe(false);
		expect(student.courses[0].sections[0].components[0].pointsGiven).toBe(0);
		expect(student.courses[0].sections[0].components[0].isComplete).toBe(true);
		expect(student.points).toBe(0);
		expect(student.level).toBe(1);

		const updatedStudent = await db.collection('students').findOne({ baseUser: userId });

		expect(updatedStudent.courses[0].totalPoints).toBe(0);
		expect(updatedStudent.courses[0].isComplete).toBe(false);
		expect(updatedStudent.courses[0].sections[0].totalPoints).toBe(0);
		expect(updatedStudent.courses[0].sections[0].isComplete).toBe(false);
		expect(updatedStudent.courses[0].sections[0].components[0].pointsGiven).toBe(0);
		expect(updatedStudent.courses[0].sections[0].components[0].isComplete).toBe(true);
		expect(updatedStudent.points).toBe(0);
		expect(updatedStudent.level).toBe(1);
	});

	it('route should return 200 with the updated student (lecture + exercise)', async () => {

		await request(`http://localhost:${PORT}`)
			.patch('/api/students/' + userId + '/complete')
			.set('token', token)
			.send({ comp: fakeLecture, isComplete: true, points: 0 })
			.expect(200);

		await request(`http://localhost:${PORT}`)
			.patch('/api/students/' + userId + '/complete')
			.set('token', token)
			.send({ comp: fakeExercise, isComplete: true, points: 10 })
			.expect(200);

		const updatedStudent = await db.collection('students').findOne({ baseUser: userId });

		expect(updatedStudent.courses[0].totalPoints).toBe(10);
		expect(updatedStudent.courses[0].isComplete).toBe(true);
		expect(updatedStudent.courses[0].sections[0].totalPoints).toBe(10);
		expect(updatedStudent.courses[0].sections[0].isComplete).toBe(true);
		expect(updatedStudent.courses[0].sections[0].components[0].pointsGiven).toBe(0);
		expect(updatedStudent.courses[0].sections[0].components[0].isComplete).toBe(true);
		expect(updatedStudent.courses[0].sections[0].components[1].pointsGiven).toBe(10);
		expect(updatedStudent.courses[0].sections[0].components[1].isComplete).toBe(true);
		expect(updatedStudent.points).toBe(10);
		expect(updatedStudent.level).toBe(1);
	});
});

describe('Routes for leaderboard', () => {
	beforeEach(async () => {
		fakeStudent.completedCourses = [
			{
				courseId: fakeCourse._id,
				totalPoints: 0,
				isComplete: true,
				completionDate: new Date(),
				completedSections: [
					{
						sectionId: fakeSection._id,
						totalPoints: 0,
						isComplete: true,
						completionDate: new Date(),
						completedExercises: [
							{
								exerciseId: fakeExercise._id,
								isComplete: true,
								completionDate: new Date(),
								pointsGiven: 10
							}
						]
					}
				]
			}
		];

		// Create a baseUser as the leaderboard also fetches the first- and last name of the user
		const fakeUser = {
			_id: mongoose.Types.ObjectId(fakeStudent.baseUser),
			firstName: 'John',
			lastName: 'Doe',
		};

		await db.collection('students').updateOne({ baseUser: fakeStudent.baseUser }, { $set: fakeStudent });
		await db.collection('users').insertOne(fakeUser);
	});

	afterEach(async () => {
		// Remove the user from the database after each test
		await db.collection('students').deleteOne({ baseUser: userId });
		await db.collection('users').deleteOne({ _id: userId });
	});

	it('Gets the leaderboard for all time', async () => {
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/students/leaderboard')
			.send({
				timeInterval: 'all'
			})
			.expect(200);

		expect(response.body[0].firstName).toBe('John');  
		expect(response.body[0].lastName).toBe('Doe');  
	});

	it('Gets the leaderboard for all month', async () => {
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/students/leaderboard')
			.send({
				timeInterval: 'month'
			})
			.expect(200);

		expect(response.body).toBeInstanceOf(Array);  
	});

	it('Gets the leaderboard for all week', async () => {
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/students/leaderboard')
			.send({
				timeInterval: 'week'
			})
			.expect(200);

		expect(response.body).toBeInstanceOf(Array);  
	});

	it('Gets the leaderboard for all day', async () => {
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/students/leaderboard')
			.send({
				timeInterval: 'day'
			})
			.expect(200);

		expect(response.body).toBeInstanceOf(Array);  
	});

	it('Return error code E0015 with illegal time interval', async () => {
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/students/leaderboard')
			.send({
				timeInterval: 'Illegal time interval'
			})
			.expect(500);

		expect(response.body.error.code).toBe('E0015');
	});
});

afterEach(async () => {
	await db.collection('students').deleteMany({}); // Delete all documents in the 'students' collection
});

afterAll(async () => {
	await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
	await db.collection('sections').deleteMany({}); // Delete all documents in the 'courses' collection
	await db.collection('exercises').deleteMany({}); // Delete all documents in the 'courses' collection
	await db.collection('students').deleteMany({}); // Delete all documents in the 'courses' collection
	server.close();
	await mongoose.connection.close();
});