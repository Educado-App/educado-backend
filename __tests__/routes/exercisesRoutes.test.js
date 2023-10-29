const request = require('supertest');
const express = require('express');
const router = require('../../routes/exerciseRoutes'); // Import your router file here
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeSection = require('../fixtures/fakeSection');
const makeFakeExercise = require('../fixtures/fakeExercise');
const mongoose = require('mongoose');
const { signAccessToken } = require('../../helpers/token');
const errorCodes = require('../../helpers/errorCodes')

const app = express();
app.use(express.json());
app.use('/api/exercises', router); // Add your router to the Express app

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
let fakeSection = makeFakeSection();
let fakeExercise = makeFakeExercise();


describe('Create exercise route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('sections').insertOne(fakeSection);
  });

  it('Creates a exercise for a given course', async () => {
    const token = signAccessToken({id: fakeUser._id});
    const response = await request(app)
      .put('/api/exercises/' + fakeSection._id)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test exercise', question: 'Test question', answers: {text: "test", correct: false, feedback: "test"} })
      .expect(201);

    expect(response.body.title).toBe('Test exercise');
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
    await db.collection('exercises').deleteMany({}); // Delete all documents in the 'exercises' collection
  });

});


describe('PATCH: Update exercise route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
    await db.collection('exercises').insertOne(fakeExercise);
  });

  it('Update the fake exercise', async () => {
    const token = signAccessToken({id: fakeUser._id});
    const response = await request(app)
      .patch('/api/exercises/' + fakeExercise._id)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', question: 'Test question' })
      .expect(200);
    
    expect(response.body.title).toBe('Test');
    expect(response.body.question).toBe('Test question');
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('exercises').deleteMany({}); // Delete all documents in the 'exercises' collection
  });
});


afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});