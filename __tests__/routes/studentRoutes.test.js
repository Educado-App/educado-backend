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
let fakeSection = makeFakeSection();
let fakeExercise = makeFakeExercise();
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

describe('GET /students/:userId/subscriptions', () => {
  it('Should get user subscriptions', async () => {

    const courseId = '651d3a15cda7d5bd2878dfc7';
    const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });

    // Find the user and update their subscriptions
    const result = await db.collection('students').findOneAndUpdate(
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

describe('PATCH /api/students/:userId/completed', () => { 
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

    // Add the connection between the course, section, and exercise
    fakeCourse.sections.push(fakeSection._id);

    fakeSection.components.push(fakeExercise._id);
    fakeSection.parentCourse = fakeCourse._id;

    fakeExercise.parentSection = fakeSection._id;

    // Update course in the database
    await db.collection('courses').updateOne({ _id: fakeCourse._id }, { $set: fakeCourse });

    // Update section in the database
    await db.collection('sections').updateOne({ _id: fakeSection._id }, { $set: fakeSection });

    // Update exercise in the database
    await db.collection('exercises').updateOne({ _id: fakeExercise._id }, { $set: fakeExercise });
});


  afterEach(async () => {
    // Remove the user from the database after each test
    await db.collection('students').deleteOne({ baseUser: userId });

    // Remove the course from the database after each test
    await db.collection('courses').deleteOne({ _id: fakeCourse._id });

    // Remove the section from the database after each test
    await db.collection('sections').deleteOne({ _id: fakeSection._id });

    // Remove the exercise from the database after each test
    await db.collection('exercises').deleteOne({ _id: fakeExercise._id });
  });

  it('Adds exerciseId to completed exercises correctly', async () => {
    const exerciseId = fakeExercise._id; // Replace this with an actual exercise ID from your database

    await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId, isComplete: true, points: 10 })
      .expect(200);
  
    // Fetch the user from the database to verify the changes
    const updatedUser = await db.collection('students').findOne({ baseUser: userId });
        
    const completedExerciseIds = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.exerciseId.toString());
    expect(completedExerciseIds).toEqual([exerciseId.toString()]);
  }); 

  it('Adds two exerciseIds to completed exercises correctly, with different parentCourses', async () => {
    // creates the second exercise
    let fakeCourse2 = makeFakeCourse();
    let fakeSection2 = makeFakeSection();
    let fakeExercise2 = makeFakeExercise();

    // Insert the fake course into the database
    await db.collection('courses').insertOne(fakeCourse2);

    // Insert the fake section into the database
    await db.collection('sections').insertOne(fakeSection2);

    // Insert the fake exercise into the database
    await db.collection('exercises').insertOne(fakeExercise2);

    // Add the connection between the course, section, and exercise
    fakeCourse2.sections.push(fakeSection2._id);

    fakeSection2.components.push(fakeExercise2._id);
    fakeSection2.parentCourse = fakeCourse2._id;

    fakeExercise2.parentSection = fakeSection2._id;

    // Update course, section and exericse in the database
    await db.collection('courses').updateOne({ _id: fakeCourse2._id }, { $set: fakeCourse2 });
    await db.collection('sections').updateOne({ _id: fakeSection2._id }, { $set: fakeSection2 });
    await db.collection('exercises').updateOne({ _id: fakeExercise2._id }, { $set: fakeExercise2 });

    const exerciseId = fakeExercise._id;
    const exerciseId2 = fakeExercise2._id;

    await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId, isComplete: true, points: 10 })
      .expect(200);

    await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId2, isComplete: true, points: 10 })
      .expect(200);

    // Fetch the user from the database to verify the changes
    const updatedUser = await db.collection('students').findOne({ baseUser: userId });

    const completedExerciseIds = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.exerciseId.toString());
    const completedExerciseIds2 = updatedUser.completedCourses[1].completedSections[0].completedExercises.map(exercise => exercise.exerciseId.toString());
    expect(completedExerciseIds).toEqual([exerciseId.toString()]);
    expect(completedExerciseIds2).toEqual([exerciseId2.toString()]);

    let totalPointsForCourse = updatedUser.completedCourses[0].totalPoints;
    let totalPointsForSection = updatedUser.completedCourses[0].completedSections[0].totalPoints;

    expect(totalPointsForCourse).toEqual(10);
    expect(totalPointsForSection).toEqual(10);
  });

  it('Adds two exerciseIds to completed exercises correctly, with same parentCourse', async () => {
    // creates the second exercise
    fakeExercise2 = makeFakeExercise();

    // Insert the fake exercise into the database
    await db.collection('exercises').insertOne(fakeExercise2);

    // Add the connection between the course, section, and exercise
    fakeSection.components.push(fakeExercise2._id);
    fakeExercise2.parentSection = fakeSection._id;

    // Update course, section and exericse in the database
    await db.collection('sections').updateOne({ _id: fakeSection._id }, { $set: fakeSection });
    await db.collection('exercises').updateOne({ _id: fakeExercise2._id }, { $set: fakeExercise2 });

    const exerciseId = fakeExercise._id;
    const exerciseId2 = fakeExercise2._id;

    await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId, isComplete: true, points: 10 })
      .expect(200);

    await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId2, isComplete: true, points: 10 })
      .expect(200);

    // Fetch the user from the database to verify the changes
    const updatedUser = await db.collection('students').findOne({ baseUser: userId });

    const completedExerciseIds = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.exerciseId.toString());
    expect(completedExerciseIds[0]).toEqual(exerciseId.toString());
    expect(completedExerciseIds[1]).toEqual(exerciseId2.toString());

    let totalPointsForCourse = updatedUser.completedCourses[0].totalPoints;
    let totalPointsForSection = updatedUser.completedCourses[0].completedSections[0].totalPoints;

    expect(totalPointsForCourse).toEqual(20);
    expect(totalPointsForSection).toEqual(20);
  });

  it('First adds an exercise as failed, then completes it', async () => {
    const exerciseId = fakeExercise._id; // Replace this with an actual exercise ID from your database

    await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId, isComplete: false, points: 0 })
      .expect(200);

    // Fetch the user from the database to verify the changes
    let updatedUser = await db.collection('students').findOne({ baseUser: userId });
        
    let completedExerciseIds = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.exerciseId.toString());
    let pointsGivenForExercise = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.pointsGiven);
    let isExerciseComplete = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.isComplete);
    
    expect(completedExerciseIds).toEqual([exerciseId.toString()]);
    expect(pointsGivenForExercise).toEqual([0]);  
    expect(isExerciseComplete).toEqual([false]);


    await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId, isComplete: true, points: 5 })
      .expect(200);
  
    // Fetch the user from the database to verify the changes
    updatedUser = await db.collection('students').findOne({ baseUser: userId });
        
    completedExerciseIds = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.exerciseId.toString());
    pointsGivenForExercise = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.pointsGiven);
    isExerciseComplete = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.isComplete);

    expect(completedExerciseIds).toEqual([exerciseId.toString()]);
    expect(pointsGivenForExercise).toEqual([5]);
    expect(isExerciseComplete).toEqual([true]);
  });

  it('Fails to add non-existing exerciseId to completed exercises', async () => {
    const nonExistingExerciseId = new mongoose.Types.ObjectId();
  
    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + userId + '/completed')
      .set('token', token)
      .send({ exerciseId: nonExistingExerciseId })
      .expect(404);
  
      expect(response.body.error.code).toBe('E1104');
  });
  
  it('Fails to add exerciseId to completed exercises for non-existing user', async () => {
    const exerciseId = fakeExercise._id;
    const nonExistingUserId = new mongoose.Types.ObjectId();
  
    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + nonExistingUserId + '/completed')
      .set('token', token)
      .send({ exerciseId: exerciseId })
      .expect(404);
  
      expect(response.body.error.code).toBe('E0004');
  });
});

describe('PATCH /api/students/:userId', () => {
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
    ]

    // Create a baseUser as the leaderboard also fetches the first- and last name of the user
    const fakeUser = {
      _id: mongoose.Types.ObjectId(fakeStudent.baseUser),
      firstName: 'John',
      lastName: 'Doe',
    };

    await db.collection('students').updateOne({ baseUser: fakeStudent.baseUser }, { $set: fakeStudent });
    await db.collection('users').insertOne(fakeUser)
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

    expect(response.body[0].firstName).toBe("John");  
    expect(response.body[0].lastName).toBe("Doe");  
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

describe('Handles extra points for sections', () => {
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

    // Add the connection between the course, section, and exercise
    fakeCourse.sections.push(fakeSection._id);

    fakeSection.exercises.push(fakeExercise._id);
    fakeSection.parentCourse = fakeCourse._id;

    fakeExercise.parentSection = fakeSection._id;

    // Update course in the database
    await db.collection('courses').updateOne({ _id: fakeCourse._id }, { $set: fakeCourse });

    // Update section in the database
    await db.collection('sections').updateOne({ _id: fakeSection._id }, { $set: fakeSection });

    // Update exercise in the database
    await db.collection('exercises').updateOne({ _id: fakeExercise._id }, { $set: fakeExercise });

    await request(`http://localhost:${PORT}`)
      .patch('/api/students/' + fakeStudent.baseUser + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: fakeExercise._id, isComplete: true, points: 10 })
      .expect(200);
  });

  it('Gives extra point for a section and adds them to the user as well.', async () => {
    const response = await request(`http://localhost:${PORT}`)
    .patch(`/api/students/${fakeStudent.baseUser}/extraPoints/section`)
    .send({
      sectionId: fakeSection._id,
      points: 2
    })
    .expect(200);

    expect(response.body.points).toBe(12);
  })

  it('Handles student not found error', async () => {
    const nonExistingStudentId = mongoose.Types.ObjectId('5f841c2b1c8cfb2c58b78d67');
    await request(`http://localhost:${PORT}`)
    .patch(`/api/students/${nonExistingStudentId}/extraPoints/section`)
    .send({
      sectionId: fakeSection._id,
      points: 2
    })
    .expect(404);
  });

  it('Handles section not found error', async () => {
    const nonExistingSectionId = mongoose.Types.ObjectId('5f841c2b1c8cfb2c58b78d68');

    await request(`http://localhost:${PORT}`)
    .patch(`/api/students/${fakeStudent.baseUser}/extraPoints/section`)
    .send({
      sectionId: nonExistingSectionId,
      points: 2
    })
    .expect(404);
  });

  it('Handles course not in completedCourses', async () => {
    fakeSection2 = makeFakeSection();
    await db.collection('sections').insertOne(fakeSection2);

    const invalidSectionId = fakeSection2._id;

    const response = await request(`http://localhost:${PORT}`)
    .patch(`/api/students/${fakeStudent.baseUser}/extraPoints/section`)
    .send({
      sectionId: invalidSectionId,
      points: 2
    })
    .expect(400);

    expect(response.body.error.code).toBe('E0903');
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