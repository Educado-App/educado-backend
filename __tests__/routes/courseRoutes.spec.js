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
const UserModel = require('../../models/Users');
const { ObjectID } = require('mongodb');

const app = express();
app.use(express.json());
app.use('/api/courses', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5021; // Choose a port for testing
const server = app.listen(PORT);

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

  describe('GET /courses/:id', () => {


    it('should get a specific course', async () => {
      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId)

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body._id.toString()).toBe(courseId.toString());

    });

    it('should handle course not found error', async () => {

      // create non existing courseId
      const ObjectId = mongoose.Types.ObjectId;
      const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // simulate a request for a non-existent course
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0006');
    });


    it('should handle invalid course id', async () => {

      // simulate a request with invalid course id
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/this-is-an-invalid-courseId');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });

  });

  describe('GET /courses/:id/sections', () => {
    it('should get all sections from a course', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      const section = await db.collection('sections').findOne({ title: 'test section' });
      const sectionId = section._id;

      // add section to the course sections array
      const resultCourse = await db.collection('courses').findOneAndUpdate(
        { _id: courseId },
        { $push: { sections: sectionId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );
      const updatedCourse = resultCourse.value;

      // Check if the section was successfully added
      expect(updatedCourse.sections.find((element) => element == sectionId));

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId + '/sections');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);

    });

    it('should handle course not found error', async () => {

      // create non existing courseId
      const ObjectId = mongoose.Types.ObjectId;
      const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // simulate a request for a non-existent course
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId + '/sections');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0006');
    });


    it('should handle invalid course id', async () => {

      // simulate a request with invalid course id
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/this-is-an-invalid-courseId/sections');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });

    // error handling for no sections will be tested in the bottom
  });

  describe('GET /courses/:courseId/sections/:sectionId', () => {

    it('should get a specific section', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      const section = await db.collection('sections').findOne({ title: 'test section' });
      const sectionId = section._id;

      // Find the course and update its sections
      const resultCourse = await db.collection('courses').findOneAndUpdate(
        { _id: courseId },
        { $push: { sections: sectionId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );
      const updatedCourse = resultCourse.value;

      // update the section to have course as parent course:
      const resultSection = await db.collection('sections').findOneAndUpdate(
        { _id: sectionId },
        { $set: { parentCourse: courseId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );
      const updatedSection = resultSection.value;

      // Check if the section was successfully added
      expect(updatedCourse.sections.find((element) => element == sectionId));
      // Check that parentCourse was successfully added
      expect(updatedSection.parentCourse).toEqual(courseId);

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId + '/sections/' + sectionId);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
    });

    it('should handle course not found error', async () => {

      const section = await db.collection('sections').findOne({ title: 'test section' });
      const sectionId = section._id;

      // create non existing courseId
      const ObjectId = mongoose.Types.ObjectId;
      const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // simulate a request for a non-existent course
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId + '/sections/' + sectionId);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0006');
    });

    it('should handle invalid course id', async () => {

      const section = await db.collection('sections').findOne({ title: 'test section' });
      const sectionId = section._id;

      // simulate a request for a non-existent course
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/this-is-an-invalid-courseId/sections/' + sectionId);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });

    it('should handle section not found error', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // create non existing courseId
      const ObjectId = mongoose.Types.ObjectId;
      const sectionId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // simulate a request for a non-existent course
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId + '/sections/' + sectionId);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0008');
    });

    it('should handle invalid section id', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // simulate a request for a non-existent course
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId + '/sections/this-is-an-invalid-sectionId');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });

  });

  describe('POST /courses/:id/subscribe', () => {
    it('should subscribe a user to a course', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/subscribe')
        .send({ user_id: userId });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.subscriptions.find((element) => element == courseId));
    });
    it('should handle user not found error when subscribing', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // create non existing user id
      const ObjectId = mongoose.Types.ObjectId;
      const userId = new ObjectId('5f841c2b1c8cfb2c58b78d66');

      // Simulate a request to unsubscribe with an non existing user id
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/subscribe')
        .send({ user_id: userId });


      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0004');
    });

    it('should handle ivalid user id when subscribing', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // Simulate a request to unsubscribe with an invalid user id
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/subscribe')
        .send({ user_id: 'this-is-an-invalid-userId' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });

    it('should handle course not found error when subscribing', async () => {

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // create non existing courseId
      const ObjectId = mongoose.Types.ObjectId;
      const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // Simulate a request to unsubscribe with an invalid user id
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/subscribe')
        .send({ user_id: userId });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0006');
    });

    it('should handle invalid course id when subscribing', async () => {

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // Simulate a request to unsubscribe with an invalid user id
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/this-is-aninvalid-courseId/subscribe')
        .send({ user_id: userId });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });
  });

  describe('POST /courses/:id/unsubscribe', () => {
    it('should unsubscribe a user from a course', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/unsubscribe')
        .send({ user_id: userId });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.subscriptions.find((element) => element !== courseId));

    });
    it('should handle user not found error when unsubscribing', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // create non existing user id
      const ObjectId = mongoose.Types.ObjectId;
      const userId = new ObjectId('5f841c2b1c8cfb2c58b78d66');

      // Simulate a request to unsubscribe with an non existing user id
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/unsubscribe')
        .send({ user_id: userId });


      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0004');
    });

    it('should handle ivalid user id when unsubscribing', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // Simulate a request to unsubscribe with an invalid user id
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/unsubscribe')
        .send({ user_id: 'this-is-an-invalid-userId' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });

    it('should handle course not found error when unsubscribing', async () => {

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // create non existing courseId
      const ObjectId = mongoose.Types.ObjectId;
      const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // Simulate a request to unsubscribe with an invalid user id
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/unsubscribe')
        .send({ user_id: userId });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0006');
    });

    it('should handle invalid course id when unsubscribing', async () => {

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // Simulate a request to unsubscribe with an invalid user id
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/this-is-aninvalid-courseId/unsubscribe')
        .send({ user_id: userId });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });
  });

  describe('GET /courses/:id/sections, error handling', () => {

    it('should handle course does not contain sections', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      const resultCourse = await db.collection('courses').findOneAndUpdate(
        { _id: courseId },
        { $set: { sections: [] } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );
      const updatedCourse = resultCourse.value;

      expect(updatedCourse.sections).toHaveLength(0);


      // send request where there the course does not have sections
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId + '/sections');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0009');


    });

    it('should handle sections not found', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      const section = await db.collection('sections').findOne({ title: 'test section' });
      const sectionId = section._id;

      // delete all sectionsn
      await db.collection('sections').deleteMany({});

      // add section to the course sections array
      const resultCourse = await db.collection('courses').findOneAndUpdate(
        { _id: courseId },
        { $push: { sections: sectionId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );
      const updatedCourse = resultCourse.value;

      // Check if the section was successfully added
      expect(updatedCourse.sections.find((element) => element == sectionId));

      // send request where there are no sections in db that match the course's sections
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses/' + courseId + '/sections');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0007');
    });
  });


  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
    await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
    await server.close();
    await mongoose.connection.close();
  });

});