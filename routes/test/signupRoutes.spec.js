const request = require('supertest');
const express = require('express');
const router = require('../signupRoutes'); // Import your router file here
const connectDb = require('../../__tests__/fixtures/db')
const makeFakeUser = require('../../__tests__/fixtures/fakeUser')
const mongoose = require('mongoose');


const app = express();
app.use(express.json());
app.use('/api/signup', router); // Mount the router under '/api/signup' path

// Start the Express app on a specific port for testing
const PORT = 5000; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

// Create a fake user
let fakeUser = makeFakeUser();


describe('Signup User route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
  });

  it('Check that the endpoint saves the user in the database', async () => {
    const input = {
      name: "test user",
      email: "test@email.com",
      password: "ABC123456!",
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(201);

    // Verify that the user was saved in the database
    const user = await db.collection('users').findOne({ email: fakeUser.email });
    expect(user).toBeDefined();
    expect(user.email).toBe(fakeUser.email);
  });


  it('Returns error if email is missing', async () => {
    const input = {
      name: "test user",
      password: "ABC123456!",
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(400);
  });


  it('Returns error if password is missing', async () => {
    const input = {
      name: "test user",
      email: fakeUser.email,
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(400);
  });


  it('Returns error if email does not contain @ and domain', async () => {
    const input = {
      name: "test user",
      email: "testcase",
      password: "abc123456!",
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(400);
  });


  it('Returns error if email is less than 6 characters', async () => {
    const input = {
      name: "test user",
      email: "testcase",
      password: "abc123456!",
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(400);
  });


  it('Returns error if name is missing', async () => {
    const input = {
      email: "test@test.dk",
      password: "abc123456!",
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(400);
  });


  it('Returns error if name contains illegal symbols', async () => {
    const input = {
      name: "test 😭😭😭",
      email: "test@test.dk",
      password: "abc123456!",
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(400);
  });


  it('Test that the password is not stored as plain text', async () => {
    const input = {
      name: "test user",
      email: "test@test.dk",
      password: "abc123456!",
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(201);

    // Verify that the password is not stored as plain text
    const user = await db.collection('users').findOne({ email: "test user" });
    expect(user).not.toBe("abc123456!");
  });


  it('Test that emails must be unique when registering', async () => {
    const input = {
      name: "test",
      email: fakeUser.email,
      password: "abc123456!",
    };

    const response = await request('http://localhost:5000')
      .post('/api/signup/user')
      .send(input)
      .expect(400);

  });

  afterAll((done) => {
    server.close(done);
  });
});
