const request = require('supertest');
const express = require('express');
const router = require('../../routes/authRoutes'); // Import your router file here
const connectDb = require('../../__tests__/fixtures/db')
const makeFakeUser = require('../../__tests__/fixtures/fakeUser')
const mongoose = require('mongoose');
const { encrypt } = require('../../helpers/Password');

const app = express();
app.use(express.json());
app.use('/api', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5020; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

const fakeUser = makeFakeUser();

describe('Login User route', () => {

  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    // Insert the fake user into the database
    await db.collection('users').insertOne(fakeUser);
  });

  it('Returns error if user is not found', async () => {
    const nonExistingUser = {
      email: 'iDontExist@test.dk',
      password: encrypt("12345678")
    }

    // Send a Post request to the login endpoint
    const response = await request(`http://localhost:${PORT}`)
      .post('/api/auth/login')
      .send(nonExistingUser)
      .expect(404);

    // Verify the response body
    expect(response.body.message).toBe("User not found");
  });


  it('Returns error if password is incorrect', async () => {
    const incorrectPassword = {
      email: fakeUser.email,
      password: "incorrectPassword"
    }

    const response = await request(`http://localhost:${PORT}`)
      .post('/api/auth/login')
      .send(incorrectPassword)
      .expect(401);  

    // Verify the response body
    expect(response.body.message).toBe("Incorrect password");
  });


  it('Returns token if user is found and password is correct', async () => {
    const correctCredentials = {
      email: fakeUser.email,
      password: "ABC123456!"
    };

    const response = await request(`http://localhost:${PORT}`)
      .post('/api/auth/login')
      .send(correctCredentials)
      .expect(202);

    // Verify the response body
    expect(response.body.status).toBe("login successful");
    expect(response.body.accessToken).toBeDefined();
  });

  afterAll((done) => {
    db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    server.close(done);
  });
});