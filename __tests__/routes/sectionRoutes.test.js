const request = require('supertest');
const express = require('express');
const router = require('../../routes/sectionRoutes'); // Import your router file here
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeSection = require('../fixtures/fakeSection');
const mongoose = require('mongoose');
const { signAccessToken } = require('../../helpers/token');
const errorCodes = require('../../helpers/errorCodes')

const app = express();
app.use(express.json());
app.use('/api/sections', router); // Add your router to the Express app

// Mock Google OAuth2 clientID
jest.mock('../../config/keys', () => {
  return {
    GOOGLE_CLIENT_ID: 'test',
    TOKEN_SECRET: 'test',
  };
});

// Start the Express app on a specific port for testing
const PORT = 5022; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

let fakeUser = makeFakeUser();
let fakeCourse = makeFakeCourse();
let fakeSection = makeFakeSection();


describe('Create section route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('courses').insertOne(fakeCourse);
    await db.collection('users').insertOne(fakeUser);
  });

  it('Creates a section for a given course', async () => {
    const token = signAccessToken({id: fakeUser._id});
    const response = await request(app)
      .put('/api/sections/' + fakeCourse._id)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Section' })
      .expect(201);

    expect(response.body.title).toBe('Test Section');
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
    await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
  });

});


describe('DELETE: Delete Sections route', () => {

  let db; // Store the database connection
  let sectionCreate; // Store the section created

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('courses').insertOne(fakeCourse);
  });

  it('Creates a section for a given course', async () => {
    const token = signAccessToken({id: fakeUser._id});
    sectionCreate = await request(app)
      .put('/api/sections/' + fakeCourse._id)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Section', description: 'Sewing test', lectures: [], exercises: [], totalPoints: 5 })
      .expect(201);

    expect(sectionCreate.body.title).toBe('Test Section');
  });

  it('Delete the created section', async () => {
    const token = signAccessToken({id: fakeUser._id});

    const response = await request(app)
      .delete('/api/sections/' + sectionCreate.body._id)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.text).toBe("Section Deleted");
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
    await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
  });

});


describe('PATCH: Update sections route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('sections').insertOne(fakeSection);
  });

  it('Update the fake section', async () => {
    const token = signAccessToken({id: fakeUser._id});
    const response = await request(app)
      .patch('/api/sections/' + fakeSection._id)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', description: 'Sewing test' })
      .expect(200);
    
    expect(response.body.title).toBe('Test');
    expect(response.body.description).toBe('Sewing test');
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
    await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
  });
});


afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});