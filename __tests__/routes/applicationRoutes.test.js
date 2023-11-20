const request = require('supertest');
const express = require('express');
const router = require('../../routes/applicationRoutes');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const app = express();
app.use(express.json());
app.use('/api/application', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5019; // Choose a port for testing
const server = app.listen(PORT, () => {
});

//mock user
const newUser = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'test@example.com'
};

describe('Application Routes', () => {
  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database
  });

  beforeEach(async () => {
    await db.collection('user').insertOne(newUser);
  });

  afterEach(async () => {
    await db.collection('user').deleteMany({}); // Delete all documents in the 'users' collection

  });

  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
  });

  // Test GET request
  describe('GET /api/application/:id', () => {
    it('should get user data by ID', async () => {
        const fakeId = newUser._id;
        console.log("fakeId: " + fakeId);

        const response = await request(app)
            .get(`/api/application/${fakeId}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('success', true);
    });

    it('should handle user not found error', async () => {
        // const nonExistentId = 'nonExistentId';
        const nonExistentId = '0123456789abcdef01234567';

        const response = await request(app)
            .get(`/api/application/${nonExistentId}`)
            .expect('Content-Type', /json/)
            .expect(500);

        expect(response.body).toHaveProperty('error');
    });
  });

  // Test POST request
  describe('POST /api/application/newapplication', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/application/newapplication')
        .send(newUser)
        .expect(201);

        expect(response.body).toHaveProperty('application');
    });

    it('should handle invalid user data', async () => {
        const invalidApplication = { email: 'testapplication@fail.com' };

        const response = await request(app)
            .post('/api/application/newapplication')
            .send(invalidApplication)
            .expect(500);

        expect(response.body).toHaveProperty('error');
    });
  });
});
