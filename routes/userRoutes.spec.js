const request = require('supertest');
const express = require('express');
const router = require('../routes/userRoutes'); // Import your router file here
const connectDb = require('../__tests__/fixtures/db')
const makeFakeUser = require('../__tests__/fixtures/fakeUser')
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use('/api/user', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5000; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

const fakeUser = makeFakeUser();

describe('Update User Email Route', () => {

    let db; // Store the database connection

    beforeAll(async () => {
        db = await connectDb(); // Connect to the database

        // Insert the fake user into the database
        await db.collection('users').insertOne(fakeUser);
    });

    it('updates user email successfully', async () => {
        const newEmail = 'newemail@example.com';

        // Send a PUT request to the update-email endpoint
        const response = await request('http://localhost:5000')
        .put('/api/user/update-email/' + fakeUser._id)
        .send({ newEmail })
        .expect(200);

        // Verify the response body
        expect(response.body.message).toBe('Email updated successfully');
        expect(response.body.user.email).toBe(newEmail);
    });

    it('handles user not found error for update-email', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const newEmail = 'newemail@example.com';

        // Send a PUT request to the update-email endpoint with a non-existent user ID
        await request('http://localhost:5000')
        .put('/api/user/update-email/' + nonExistentUserId)
        .send({ newEmail })
        .expect(404);
    });

    it('updates user first name successfully', async () => {
        // Send a PUT request to the update-first_name endpoint using the inserted user's ID
        await request('http://localhost:5000')
          .put(`/api/user/update-first_name/${fakeUser._id}`)
          .send({ newFirstName: 'NewFirstName' })
          .expect(200);
    });

    it('handles user not found error for update-first_name', async () => {
        // Create a non-existent user ID
        const nonExistentUserId = new mongoose.Types.ObjectId();
    
        // Send a PUT request to the update-first_name endpoint with a non-existent user ID
        await request('http://localhost:5000')
            .put(`/api/user/update-first_name/${nonExistentUserId}`)
            .send({ newFirstName: 'NewFirstName' })
            .expect(404);
    
        // Your assertions and expectations based on the response...
        });
    
    it('updates user last name successfully', async () => {
    // Send a PUT request to the update-last_name endpoint using the inserted user's ID
    await request('http://localhost:5000')
        .put(`/api/user/update-last_name/${fakeUser._id}`)
        .send({ newLastName: 'NewLastName' })
        .expect(200);
    });

    it('handles user not found error for update-last_name', async () => {
    // Create a non-existent user ID
    const nonExistentUserId = new mongoose.Types.ObjectId();

    // Send a PUT request to the update-last_name endpoint with a non-existent user ID
    await request('http://localhost:5000')
        .put(`/api/user/update-last_name/${nonExistentUserId}`)
        .send({ newLastName: 'NewLastName' })
        .expect(404);
    });

    afterAll((done) => {
        server.close(done);
    });
});
