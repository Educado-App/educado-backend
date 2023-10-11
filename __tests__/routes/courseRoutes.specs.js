const request = require('supertest');
const express = require('express');
const router = require('../../routes/courseRoutes'); 
const mongoose = require('mongoose'); 
const connectDb = require('../../__tests__/fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeSection = require('../fixtures/fakeSection');
const CourseModel = require('../../models/Courses');
const SectionModel = require('../../models/Sections');
const ExerciseModel = require('../../models/Exercises');
const User = require('../../models/User');

const app = express();
app.use(express.json());
app.use('/api', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5021; // Choose a port for testing
const server = app.listen(PORT, () => {
	console.log(`Express server is running on port ${PORT}`);
});

// Create a fake user, course and section
let fakeUser = makeFakeUser();
let fakeCourse = makeFakeCourse();
let fakeSection = makeFakeSection();

describe('Course Routes', () => {

  let db; // Store the database connection

	beforeAll(async () => {
		db = await connectDb(); // Connect to the database

		// Insert the fake user, courses and sections into the database
		await db.collection('users').insertOne(fakeUser);
    await db.collection('courses').insertOne(fakeCourse);
    await db.collection('sections').insertOne(fakeSection);

	});

  describe('GET /courses', () => {
    it('should get all courses', async () => {

      const response = await request(`http://localhost:${PORT}`)
      .get('/api/courses');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      

    });
  });

  describe('GET /courses/:id', () => {
    it('should get a specific course', async () => {
      const course = await db.collection('courses').findOne({ title: 'test course'});
      const courseId = course._id

		  const response = await request(`http://localhost:${PORT}`)
			.get('/api/courses/' + courseId)

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body._id.toString()).toBe(courseId.toString());

    });
  });

  describe('GET /courses/:id/sections', () => {
    it('should get all sections from a course', async () => {
      const course = await db.collection('courses').findOne({ title: 'test course'});
      const courseId = course._id;

      const response = await request(`http://localhost:${PORT}`)
      .get('/api/courses/' + courseId + '/sections');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);

    });
  });

  describe('GET /courses/:courseId/sections/:sectionId', () => {
    it('should get a specific section', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course'});
      const courseId = course._id;

      const section = await db.collection('sections').findOne({title: 'test section'});
      const sectionId = section._id;

      const response = await request(`http://localhost:${PORT}`)
      .get('/api/courses/' + courseId + '/sections/' + sectionId);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);

    });
  });

  describe('POST /courses/:id/subscribe', () => {
    it('should subscribe a user to a course', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course'});
      const courseId = course._id;

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com'});
      const userId = user._id;

      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/subscribe')
        .send({ user_id: userId});

      console.log("course id: " + courseId)
      console.log('response.body.subscriptions:', response.body.subscriptions)
      console.log(response.body.subscriptions.find((element) => element == courseId))

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.subscriptions.find((element) => element == courseId));
    });
  });

  describe('POST /courses/:id/unsubscribe', () => {
    it('should unsubscribe a user from a course', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course'});
      const courseId = course._id;

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com'});
      const userId = user._id;

      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/unsubscribe')
        .send({ user_id: userId });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.subscriptions.find((element) => element !== courseId));

    });
  });

  describe('GET /users/:id/subscriptions', () => {
    it('should get user subscriptions', async () => {

      const courseId = '651d3a15cda7d5bd2878dfc7';
      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;
    
      // Find the user and update their subscriptions
      const result = await db.collection('users').findOneAndUpdate(
        { _id: userId }, // Convert userId to ObjectId if needed
        { $push: { subscriptions: courseId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );

      const updatedUser = result.value;
          
      // Check if the subscription was successfully added
      expect(updatedUser.subscriptions.includes(courseId)).toBe(true);

      const response = await request(`http://localhost:${PORT}`)
      .get('/api/users/' + userId + '/subscriptions');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.find((element) => element == courseId));

    });
  });

  describe('GET /users', () => {
    
    it('should check if a user is subscribed to a specific course and return true', async () => {
      const courseId = '651d3a15cda7d5bd2878dfc7';
      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;
    
      // Find the user and update their subscriptions
      const result = await db.collection('users').findOneAndUpdate(
        { _id: userId }, // Convert userId to ObjectId if needed
        { $push: { subscriptions: courseId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );

      const updatedUser = result.value;
    
      // Check if the subscription was successfully added
      expect(updatedUser.subscriptions.includes(courseId)).toBe(true);

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users?user_id=' + userId + '&course_id=' + courseId);
    
      expect(response.status).toBe(200);
      expect(response.text).toBe('true');
    });    
  
    

    it('should return false if a user is not subscribed to a specific course', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course'});
      const courseId = course._id;

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com'});
      const userId = user._id; 
      
      const response = await request(`http://localhost:${PORT}`)
      .get('/api/users?user_id=' + userId + '&course_id=' + courseId);

      expect(response.status).toBe(200);
      expect(response.text).toBe('false');

    });
  });


afterAll(async () => {
  db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
  db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
  db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
  server.close();
  await mongoose.connection.close();
});

});
