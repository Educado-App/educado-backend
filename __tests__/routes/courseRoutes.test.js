const request = require('supertest');
const express = require('express');
const router = require('../../routes/courseRoutes'); // Import your router file here
const connectDb = require('../../__tests__/fixtures/db');
const makeFakeUser = require('../../__tests__/fixtures/fakeUser');
const { getFakeCourses, getFakeCoursesByCreator } = require('../../__tests__/fixtures/fakeCourses');
const mongoose = require('mongoose');
const { encrypt } = require('../../helpers/password');
const { signAccessToken } = require('../../helpers/token');

const app = express();
app.use(express.json());
app.use('/api', router); // Add your router to the Express app

// Mock Google OAuth2 clientID
jest.mock('../../config/keys', () => {
  return {
    GOOGLE_CLIENT_ID: 'test',
    TOKEN_SECRET: 'test',
  };
});

// Start the Express app on a specific port for testing
const PORT = 5022; // Choose a port for testing
const ADMIN_ID = 'srdfet784y2uioejqr';
const server = app.listen(PORT);

const fakeUser = makeFakeUser();
const fakeCourses = getFakeCourses();

describe('Get all courses for user route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('courses').insertMany(fakeCourses);
  });

  it('Returns courses made by a given user', async () => {

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
          coverImg: courses[i].coverImg,
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

    expect(result.error).toBe('You are not allowed to access this content!');
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
  });

});

describe('Get all courses route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('courses').insertMany(fakeCourses);
  });

  it('Returns courses', async () => {

    // Send a get request to the courses endpoint

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
        coverImg: fakeCourses[i].coverImg,
        category: fakeCourses[i].category,
        published: fakeCourses[i].published,
        sections: fakeCourses[i].sections,
        creator: fakeCourses[i].creator,
        difficulty: fakeCourses[i].difficulty,
        time: fakeCourses[i].time,
        rating: fakeCourses[i].rating,
      });
      i++;
    });
  });

  it('Returns error 401 if user is not authorized to access', async () => {
    // Send a get request to the courses endpoint
    const res = await request(`http://localhost:${PORT}`)
      .get(`/api/courses/creator/${fakeUser._id}`)
      .set('token', signAccessToken({ id: 'notAuthorized' }));
    expect(res.statusCode).toEqual(401);
    // Verify response body
    const result = res.body;

    expect(result.error).toBe('You are not allowed to access this content!');
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
  });
});


afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});