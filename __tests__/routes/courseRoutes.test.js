const request = require('supertest');
const express = require('express');
const router = require('../../routes/courseRoutes');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeSection = require('../fixtures/fakeSection');
const { signAccessToken } = require('../../helpers/token');
const errorCodes = require('../../helpers/errorCodes');
const { getFakeCourses, getFakeCoursesByCreator } = require('../fixtures/fakeCourses');

const app = express();
app.use(express.json());
app.use('/api/courses', router); // Mount the router under '/api' path

// Mock Google OAuth2 clientID
jest.mock('../../config/keys', () => {
  return {
    GOOGLE_CLIENT_ID: 'test',
    TOKEN_SECRET: 'test',
  };
});

// Start the Express app on a specific port for testing
const PORT = 5021; // Choose a port for testing
const ADMIN_ID = 'srdfet784y2uioejqr';
const server = app.listen(PORT);

// Create a fake user, course and section
let fakeUser = makeFakeUser();
let fakeCourse = makeFakeCourse();
let fakeSection = makeFakeSection();
let fakeCourses = getFakeCourses();


describe('Course Routes', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database
  });

  beforeEach(async () => {
    // Insert the fake user, courses and sections into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('courses').insertOne(fakeCourse);
    await db.collection('sections').insertOne(fakeSection);
  });

  afterEach(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
    await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
  });

  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
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

    it('should handle invalid user id when subscribing', async () => {

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

    it('Increments number of subscribers for a course, when subscribing', async () => {
      // find a course
      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // find the first user
      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // make first user subscribe to a course
      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + course._id + '/subscribe')
        .send({ user_id: user._id });
      // check the post request is successful
      expect(response.status).toBe(200);

      // check the number of subscribers is incremented
      const updatedCourse = await db.collection('courses').findOne({ _id: courseId });
      const updatedUser = await db.collection('users').findOne({ _id: userId });
      expect(updatedCourse.numOfSubscriptions).toBe(1);
      expect(updatedUser.subscriptions).toHaveLength(1);
      expect(updatedUser.subscriptions.find((element) => element == courseId));
    });

    it('should handle user already subscribed error', async () => {
      // find a course
      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // find the first user
      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // make user subscribe to a course
      const response1 = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + course._id + '/subscribe')
        .send({ user_id: user._id });
      expect(response1.status).toBe(200);

      // make user subscribe to the course again
      const response2 = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + course._id + '/subscribe')
        .send({ user_id: user._id });
      expect(response2.status).toBe(400);
      // Cannot subscribe to course: User is already subscribed to course
      expect(response2.body.error.code).toBe('E0605');
    });
  });
  describe('POST /courses/:id/unsubscribe', () => {
    it('Error when unsubscribing to course with no subscriptions', async () => {
      // find a course and set number of subscription to 3
      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // find a user and add the course to the user's subscriptions
      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      const response = await request(`http://localhost:${PORT}`)
        .post('/api/courses/' + courseId + '/unsubscribe')
        .send({ user_id: userId });
      // check the post request is successful
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('E0606');

      // check the number of subscribers is correct
      const courseNew = await db.collection('courses').findOne({ _id: courseId });
      const userNew = await db.collection('users').findOne({ _id: userId });
      expect(courseNew.numOfSubscriptions).toBe(0);
      expect(userNew.subscriptions).toHaveLength(0);
    });

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

  it('should handle invalid user id when unsubscribing', async () => {

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

  it('Decrements number of subscribers for a course, when unsubscribing', async () => {
    // find a course and set number of subscription to 3
    const courseUpdated = await db.collection('courses').findOneAndUpdate(
      { title: 'test course' },
      { $set: { numOfSubscriptions: 3 } },
      { returnDocument: 'after' } // 'after' returns the updated document
    );
    const updatedCourse = courseUpdated.value;

    // find a user and add the course to the user's subscriptions
    const userUpdated = await db.collection('users').findOneAndUpdate(
      { email: 'fake@gmail.com' },
      { $push: { subscriptions: updatedCourse._id } },
      { returnDocument: 'after' } // 'after' returns the updated document
    );
    const updatedUser = userUpdated.value;

    const response = await request(`http://localhost:${PORT}`)
      .post('/api/courses/' + updatedCourse._id + '/unsubscribe')
      .send({ user_id: updatedUser._id });
    // check the post request is successful
    expect(response.status).toBe(200);

    // check the number of subscribers is decremented
    const courseNew = await db.collection('courses').findOne({ _id: updatedCourse._id });
    const userNew = await db.collection('users').findOne({ _id: updatedUser._id });
    expect(courseNew.numOfSubscriptions).toBe(2);
    expect(userNew.subscriptions).toHaveLength(0);
  });

  describe('Get all courses for user route', () => {

    it('Returns courses made by a given user', async () => {

      // clear the database for these tests
      await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection

      // Insert the fake user into the database
      await db.collection('courses').insertMany(fakeCourses);

      const courses = getFakeCoursesByCreator(fakeUser._id);
      // Send a get request to the courses endpoint
      const res = await request(`http://localhost:${PORT}`)
        .get(`/api/courses/creator/${fakeUser._id}`)
        .set('token', signAccessToken({ id: fakeUser._id }));
      expect(res.statusCode).toEqual(200);
      // Verify response body
      const result = res.body;

      let i = 0;
      // Verify that the response body contains the correct data
      if (result.length > 0) {
        res.body.forEach(course => {
          expect(course).toMatchObject({
            _id: expect.any(String),
            title: courses[i].title,
            description: courses[i].description,
            dateCreated: expect.any(String),
            dateUpdated: expect.any(String),
            category: courses[i].category,
            published: courses[i].published,
            sections: courses[i].sections,
            creator: courses[i].creator,
            difficulty: courses[i].difficulty,
            time: courses[i].time,
            rating: courses[i].rating,
          });
          i++;
        });
      } else {
        expect(result).toStrictEqual(courses)
      }
    });

    it('Returns error 401 if user is not authorized to access', async () => {

      // Send a get request to the courses endpoint
      const res = await request(`http://localhost:${PORT}`)
        .get(`/api/courses/creator/${fakeUser._id}`)
        .set('token', signAccessToken({ id: 'notAuthorized' }));
      expect(res.statusCode).toEqual(401);
      // Verify response body
      const result = res.body;

      expect(result.error).toStrictEqual(errorCodes['E0002']);
    });

  });

  describe('Get all courses route', () => {
    it('Returns courses', async () => {
      // Send a get request to the courses endpoint

      // clear the database for these tests
      await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection

      // Insert the fake user into the database
      await db.collection('courses').insertMany(fakeCourses);

      const res = await request(`http://localhost:${PORT}`)
        .get('/api/courses')
        .set('token', signAccessToken({ id: ADMIN_ID }));
      expect(res.statusCode).toEqual(200);
      let i = 0;
      res.body.forEach(course => {
        expect(course).toMatchObject({
          _id: expect.any(String),
          title: fakeCourses[i].title,
          description: fakeCourses[i].description,
          dateCreated: expect.any(String),
          dateUpdated: expect.any(String),
          category: fakeCourses[i].category,
          published: fakeCourses[i].published,
          sections: fakeCourses[i].sections,
          creator: fakeCourses[i].creator,
          difficulty: fakeCourses[i].difficulty,
          estimatedHours: fakeCourses[i].estimatedHours,
          rating: fakeCourses[i].rating,
        });
        i++;
      });
    });

    it('Returns error 401 (E0002) if user is not authorized to access', async () => {

      let unauthorizedUser = makeFakeUser();
      unauthorizedUser.email = 'email@email.com'; // Avoiding duplicate error for email

      await db.collection('users').insertOne(unauthorizedUser);
      const unauthorizedUserInDB = await db.collection('users').findOne({ email: unauthorizedUser.email });

      // Send a get request to the courses endpoint
      const res = await request(`http://localhost:${PORT}`)
        .get(`/api/courses/creator/${fakeUser._id}`)
        .set('token', signAccessToken({ id: unauthorizedUserInDB._id }));
      expect(res.statusCode).toBe(401);
      // Verify response body
      const result = res.body;

      expect(result.error).toStrictEqual(errorCodes['E0002']);
    });

    it('returns error 404 if no courses are found', async () => {

      // delete all courses
      await db.collection('courses').deleteMany({});

      // send request with no courses in db
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/courses')
        .set('token', signAccessToken({ id: ADMIN_ID }))
        .expect(200)

      // expect empty array
      expect(response.body).toHaveLength(0);
    });

    afterAll(async () => {
      await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
      await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
    });
  });

  describe('PUT: Create Course route', () => {

    it('Creates a course', async () => {
      const token = signAccessToken({ id: fakeUser._id });
      const response = await request(app)
        .put('/api/courses/')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', category: 'sewing', difficulty: 1, description: 'Sewing test', estimatedHours: 2 })
        .expect(201);

      expect(response.body.title).toBe('Test');
      expect(response.body.category).toBe('sewing');
      expect(response.body.difficulty).toBe(1);
      expect(response.body.description).toBe('Sewing test');
      expect(response.body.estimatedHours).toBe(2);

    });
  });


  describe('DELETE: Delete Course route', () => {

    it('Delete the fake course', async () => {
      const token = signAccessToken({ id: fakeUser._id });
      const response = await request(app)
        .delete('/api/courses/' + fakeCourse._id)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.text).toBe("Course Deleted");
    });
  });


  describe('PATCH: Update course route', () => {

    it('Update the fake course', async () => {
      const token = signAccessToken({ id: fakeUser._id });
      const response = await request(app)
        .patch('/api/courses/' + fakeCourse._id)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', category: 'sewing', difficulty: 1, description: 'Sewing test', estimatedHours: 2 })
        .expect(200);

      expect(response.body.title).toBe('Test');
      expect(response.body.category).toBe('sewing');
      expect(response.body.difficulty).toBe(1);
      expect(response.body.description).toBe('Sewing test');
      expect(response.body.estimatedHours).toBe(2);
    });
  });
});

