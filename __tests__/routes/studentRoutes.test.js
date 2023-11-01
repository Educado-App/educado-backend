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

const { signAccessToken, verify } = require('../../helpers/token');

app.use(express.json());
app.use('/api/students', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5023; // Choose a port for testing
const server = app.listen(PORT);

let db;
let fakeStudent;
let fakeCourse = makeFakeCourse();
const userId = mongoose.Types.ObjectId('5f841c2b1c8cfb2c58b78d68');

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
  token = signAccessToken({ id: userId })
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

describe('GET /students/:id/subscriptions', () => {
  it('should get user subscriptions', async () => {

    const courseId = '651d3a15cda7d5bd2878dfc7';
    const user = await db.collection('students').findOne({ email: 'fake@gmail.com' });

    // Find the user and update their subscriptions
    const result = await db.collection('students').findOneAndUpdate(
      { _id: userId }, // Convert userId to ObjectId if needed
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

  it('should handle user not found error', async () => {

    // create non existing userId
    const ObjectId = mongoose.Types.ObjectId;
    const userId = new ObjectId('5f841c2a1c8cfb2c52b78d68');

    // simulate a request for a non-existent user
    const response = await request(`http://localhost:${PORT}`)
      .get('/api/students/' + userId + '/subscriptions');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('E0004');
  });


  it('should handle invalid user id', async () => {

    // simulate a request with invalid user id
    const response = await request(`http://localhost:${PORT}`)
      .get('/api/students/this-is-an-invalid-userId/subscriptions');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('E0014');
  });
});

describe('Handles answering exercises', () => {
  let actualCourse, actualSection, actualExercise;
  let fakeCourse, fakeSection, fakeExercise;
  beforeEach(async () => {
    fakeCourse = makeFakeCourse();
    fakeSection = makeFakeSection();
    fakeExercise = makeFakeExercise();

    // Insert the fake course into the database
    await db.collection('courses').insertOne(fakeCourse);

    // Insert the fake section into the database
    await db.collection('sections').insertOne(fakeSection);

    // Insert the fake exercise into the database
    await db.collection('exercises').insertOne(fakeExercise);

    actualCourse = await db.collection('courses').findOne({ title: fakeCourse.title });
    actualSection = await db.collection('sections').findOne({ title: fakeSection.title });
    actualExercise = await db.collection('exercises').findOne({ title: fakeExercise.title });

    // Add the connection between the course, section, and exercise
    actualCourse.sections.push(actualCourse._id);

    actualSection.exercises.push(actualExercise._id);
    actualSection.parentCourse = actualCourse._id;

    actualExercise.parentSection = actualSection._id;

    // Update course in the database
    await db.collection('courses').updateOne({ _id: actualCourse._id }, { $set: actualCourse });

    // Update section in the database
    await db.collection('sections').updateOne({ _id: actualSection._id }, { $set: actualSection });

    // Update exercise in the database
    await db.collection('exercises').updateOne({ _id: actualExercise._id }, { $set: actualExercise });
  });


  afterAll(async () => {
    // Remove the user from the database after each test
    await db.collection('students').deleteMany();

    // Remove the course from the database after each test
    await db.collection('courses').deleteMany();

    // Remove the section from the database after each test
    await db.collection('sections').deleteMany();

    // Remove the exercise from the database after each test
    await db.collection('exercises').deleteMany();
  });

  it('Adds exerciseId to completed exercises correctly', async () => {
    const exerciseId = actualExercise._id; // Replace this with an actual exercise ID from your database

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId })

    expect(response.status).toBe(200); // Expecting a 200 OK response


    // Fetch the user from the database to verify the changes
    const updatedProfile = await db.collection('students').findOne({ baseUser: userId });

    const completedExerciseIds = updatedProfile.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.exerciseId.toString());
    expect(completedExerciseIds).toEqual([exerciseId.toString()]);
  });

  it('Fails to add non-existing exerciseId to completed exercises', async () => {
    const nonExistingExerciseId = new mongoose.Types.ObjectId();

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token)
      .send({ exerciseId: nonExistingExerciseId })
      .expect(400);

    expect(response.body.error.code).toBe('E0012');
  });

  it('Fails to add exerciseId to completed exercises for non-existing user', async () => {
    const exerciseId = fakeExercise._id;
    const nonExistingUserId = mongoose.Types.ObjectId('5f841c2b1c8cfb2c58b78d68');

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + nonExistingUserId + '/completed')
      .set('token', token)
      .send({ exerciseId: exerciseId })

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('E0014');
  });
});

describe('Update points and level', () => {
  it('Update points succesfully', async () => {
    const points = 10;

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId)
      .set('token', token) // Include the token in the request headers
      .send({
        points: points
      })
      .expect(200); // Expecting a 200 OK Request response

    // Verify that the user was updated in the database
    const updatedUser = await db.collection('students').findOne({ baseUser: userId });
    expect(updatedUser.points).toBe(points);
    expect(updatedUser.level).toBe(1);
  });

  it('Update level succesfully', async () => {
    const points = 120;

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId)
      .set('token', token) // Include the token in the request headers
      .send({
        points: points
      })
    
    expect(response.status).toBe(200); // Expecting a 200 OK Request response

    // Verify that the user was updated in the database
    const updatedUser = await db.collection('students').findOne({ baseUser: userId });
    expect(updatedUser.points).toBe(20);
    expect(updatedUser.level).toBe(2);
  });

  it('Handles validation errors for points', async () => {
    const invalidPoints = 'invalidPoints';

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId)
      .set('token', token) // Include the token in the request headers
      .send({
        points: invalidPoints
      })
      .expect(400); // Expecting a 400 Bad Request response

    expect(response.body.error.code).toBe('E0804');
  });

  it('Handles negative value for points', async () => {
    const invalidPoints = -50;

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId)
      .set('token', token) // Include the token in the request headers
      .send({
        points: invalidPoints
      })
      .expect(400); // Expecting a 400 Bad Request response

    expect(response.body.error.code).toBe('E0804');
  });

  it('Handles 0 value for points', async () => {
    const invalidPoints = 0;

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId)
      .set('token', token) // Include the token in the request headers
      .send({
        points: invalidPoints
      })
      .expect(400); // Expecting a 400 Bad Request response

    expect(response.body.error.code).toBe('E0804');
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