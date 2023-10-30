const request = require('supertest');
const express = require('express');
const router = require('../../routes/credentialsRoutes'); // Import your router file here
const connectDb = require('../fixtures/db');

const mongoose = require('mongoose');
const { encrypt } = require('../../helpers/password');
const token = require('../../helpers/token');
const makeFakeContentCreator = require('../fixtures/fakeContentCreator');

const app = express();
app.use(express.json());
app.use('/api/credentials', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5069; // Choose a port for testing
const server = app.listen(PORT);
const { signAccessToken, verify } = require('../../helpers/token');

const fakeContentCreator = makeFakeContentCreator();

const TOKEN_SECRET = 'test';

// Mock token secret
jest.mock('../../config/keys', () => {
    return {
      TOKEN_SECRET: TOKEN_SECRET,
    };
  });

// Login route for Content Creators
describe('Login Content Creator route', () => {
  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database  
    // Insert the fake user into the database
    await db.collection('content-creators').insertOne(fakeContentCreator);
  });

  it('Returns error if user is not found', async () => {
    const nonExistingContentCreator = {
      email: 'iDontExist@test.dk',
      password: '12345678'
    };

    // Send a Post request to the login endpoint
    const response = await request(`http://localhost:${PORT}`)
      .post('/api/credentials/login')
      .send(nonExistingContentCreator)
      .expect(401);
    // Verify the response body
    expect(response.body.error.code).toBe('E0101');
  });

  it('Returns error if password is incorrect', async () => {
    const incorrectPassword = {
      email: fakeContentCreator.email,
      password: 'incorrectPassword'
    };

    const response = await request(`http://localhost:${PORT}`)
      .post('/api/credentials/login')
      .send(incorrectPassword)
      .expect(401);
    // Verify the response body
    expect(response.body.error.code).toBe('E0105');
  });

  it('Returns token if user is found and password is correct', async () => {
    const correctCredentials = {
      email: fakeContentCreator.email,
      password: 'ABC123456!'
    };

    // Verify the response body
    const response = await request(`http://localhost:${PORT}`)
      .post('/api/credentials/login')
      .send(correctCredentials)
      .expect(202);

    // Verify the response body
    expect(response.body.status).toBe('login successful');
    expect(response.body.accessToken).toBeDefined();
  });

  afterAll(async () => {
    await db.collection('content-creators').deleteMany({}); // Delete all documents in the 'credentials' collection
  });
});

// Signup route for Content Creators
describe('Signup Content Creator route', () => {

  let db; // Store the database connection
  
  const contentCreatorInput = {
    name: 'test content creator',
    email: 'testnew@emailer.com',
    password: 'ABCDEFG123456!',
  };

	beforeAll(async () => {
		db = await connectDb(); // Connect to the database

		// Insert the fake user into the database
		await db.collection('content-creators').insertOne(fakeContentCreator);
	});

	it('Saves the user in the database', async () => {
		const response = await request(`http://localhost:${PORT}`)
			.post('/api/credentials/signup')
			.send(contentCreatorInput)
			.expect(201);
      
		// Verify that the user was saved in the database
		const contentCreator = await db.collection('content-creators').findOne({ email: contentCreatorInput.email });
		expect(contentCreator.email).toBe(contentCreatorInput.email);
	});

	it('Test that emails must be unique when registering', async () => {
		const contentCreatorInput = {
			name: 'test',
			email: fakeContentCreator.email,
			password: 'abc123456!',
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/credentials/signup')
			.send(contentCreatorInput)
			.expect(400);

		expect(response.body.error.code).toBe('E0201');
	});

  afterAll(async () => {
    await db.collection('content-creators').deleteMany({}); // Delete all documents in the 'credentials' collection
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});
