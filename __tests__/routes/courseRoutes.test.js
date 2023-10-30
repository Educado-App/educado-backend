const request = require('supertest');
const express = require('express');
const router = require('../../routes/courseRoutes'); // Import your router file here
const connectDb = require('../../__tests__/fixtures/db');
const makeFakeUser = require('../../__tests__/fixtures/fakeUser');
const makeFakeCourse = require('../../__tests__/fixtures/fakeCourse');
const { getFakeCourses, getFakeCoursesByCreator } = require('../../__tests__/fixtures/fakeCourses');
const mongoose = require('mongoose');
const { signAccessToken } = require('../../helpers/token');
const errorCodes = require('../../helpers/errorCodes')

const app = express();
app.use(express.json());
app.use('/api/courses', router); // Add your router to the Express app

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
const server = app.listen(PORT, () => {
});

let fakeUser = makeFakeUser();
const fakeCourses = getFakeCourses();
let fakeCourse = makeFakeCourse();

describe('Get all courses for user route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('courses').insertMany(fakeCourses);
    await db.collection('users').insertOne(fakeUser);
    fakeUser = await db.collection('users').findOne({ email: fakeUser.email });
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

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
  });

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

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
  });
});


describe('DELETE: Delete Course route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('courses').insertOne(fakeCourse);
  });

  it('Delete the fake course', async () => {
    const token = signAccessToken({ id: fakeUser._id });
    const response = await request(app)
      .delete('/api/courses/' + fakeCourse._id)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.text).toBe("Course Deleted");
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
  });

});


describe('PATCH: Update course route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('courses').insertOne(fakeCourse);
  });

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

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
  });
});


afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});