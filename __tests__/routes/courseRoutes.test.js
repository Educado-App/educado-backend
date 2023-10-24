const request = require('supertest');
const express = require('express');
const router = require('../../routes/courseRoutes'); // Import your router file here
const connectDb = require('../../__tests__/fixtures/db');
const makeFakeUser = require('../../__tests__/fixtures/fakeUser');
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
const server = app.listen(PORT);

let fakeUser = makeFakeUser();
const fakeCourses = getFakeCourses();

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
      .expect(404)
    expect(response.body.error.code).toBe('E0005');
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

describe('sizes', () => {
  // it('should contain four objects', () => {
  //   expect(sizes).toHaveLength(4);
  // });

  it('should have objects with width and height properties', () => {
    sizes.forEach(size => {
      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('height');
    });
  });

  it('should have objects with numeric width and height properties', () => {
    sizes.forEach(size => {
      expect(typeof size.width).toBe('number');
      expect(typeof size.height).toBe('number');
    });
  });

  it('should have objects with positive width and height properties', () => {
    sizes.forEach(size => {
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
    });
  });
});
describe('courseRoutes', () => {
  describe('GET /api/courses/:courseId/lectures/:lectureId', () => {
    it('should return the correct section', async () => {
      // Create a fake section
      const fakeSection = {
        _id: 'fakeSectionId',
        title: 'Fake Section Title',
        content: 'Fake Section Content',
        parentLecture: 'fakeLectureId',
      };

      // Save the fake section to the database
      await SectionModel.create(fakeSection);

      // Make a request to the endpoint
      const res = await request(app)
        .get(`/api/courses/${fakeSection.parentLecture.parentCourse}/lectures/${fakeSection.parentLecture}/sections/${fakeSection._id}`);

      // Expect the response to have a status code of 200
      expect(res.statusCode).toBe(200);

      // Expect the response to have the correct section
      expect(res.body).toMatchObject({
        _id: fakeSection._id,
        title: fakeSection.title,
        content: fakeSection.content,
        parentLecture: fakeSection.parentLecture,
      });
    });
  });
});