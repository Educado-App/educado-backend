const request = require('supertest');
const express = require('express');
const router = require('../../routes/lectureRoutes'); // Import your router file here
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeSection = require('../fixtures/fakeSection');
const makeFakeLecture = require('../fixtures/fakeLecture');
const mongoose = require('mongoose');
const { signAccessToken } = require('../../helpers/token');
const errorCodes = require('../../helpers/errorCodes')

const app = express();
app.use(express.json());
app.use('/api/lectures', router); // Add your router to the Express app

// Mock Google OAuth2 clientID
jest.mock('../../config/keys', () => {
  return {
    GOOGLE_CLIENT_ID: 'test',
    TOKEN_SECRET: 'test',
  };
});

// Start the Express app on a specific port for testing
const PORT = 5022; // Choose a port for testing
const server = app.listen(PORT)

let fakeUser = makeFakeUser();
let fakeSection = makeFakeSection();
let fakeLecture = makeFakeLecture();


describe('Create lectures route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('sections').insertOne(fakeSection);
  });

  it('Creates a lecture for a given course', async () => {
    const token = signAccessToken({id: fakeUser._id});
    const response = await request(app)
      .put('/api/lectures/' + fakeSection._id)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test lectures' })
      .expect(201);

    expect(response.body.title).toBe('Test lectures');
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
    await db.collection('lectures').deleteMany({}); // Delete all documents in the 'lectures' collection
  });

});


describe('DELETE: Delete lectures route', () => {

  let db; // Store the database connection
  let lectureCreate; // Store the lecture created

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('sections').insertOne(fakeSection);
  });

  it('Creates a lecture for a given course', async () => {
    const token = signAccessToken({id: fakeUser._id});
    lectureCreate = await request(app)
      .put('/api/lectures/' + fakeSection._id)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test lecture' })
      .expect(201);

    expect(lectureCreate.body.title).toBe('Test lecture');
  });

  it('Delete the created lecture', async () => {
    const token = signAccessToken({id: fakeUser._id});

    const response = await request(app)
      .delete('/api/lectures/' + lectureCreate.body._id)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.text).toBe("Lecture Deleted");
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
    await db.collection('lectures').deleteMany({}); // Delete all documents in the 'lectures' collection
  });

});


describe('PATCH: Update lectures route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('lectures').insertOne(fakeLecture);
  });

  it('Update the fake lecture', async () => {
    const token = signAccessToken({id: fakeUser._id});
    const response = await request(app)
      .patch('/api/lectures/' + fakeLecture._id)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', description: 'Sewing test' })
      .expect(200);
    
    expect(response.body.title).toBe('Test');
    expect(response.body.description).toBe('Sewing test');
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('lectures').deleteMany({}); // Delete all documents in the 'sections' collection
  });
});


afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});