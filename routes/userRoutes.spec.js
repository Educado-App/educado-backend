const request = require('supertest');
const express = require('express');
const router = require('../routes/userRoutes'); // Import your router file here
const connectDb = require('../__tests__/fixtures/db')
const makeFakeUser = require('../__tests__/fixtures/fakeUser')
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
    // Create a mock user object for testing
    req.user = { id: 'mockUserId', /* Add other user properties as needed */ };
    next();
  });

app.use('/api/user', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5000; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

const fakeUser = makeFakeUser();

describe('User routes', () => {

    let db;

    beforeAll(async () => {
        db = await connectDb();

        await db.collection('users').insertOne(fakeUser);
    });

    it('updates user email successfully', async () => {
        const newEmail = 'newemail@example.com';

        // Send a PUT request to the update-email endpoint
        const response = await request('http://localhost:5000')
        .put('/api/user/update-email/' + fakeUser._id)
        .send({ newEmail })
        .expect(200);

        expect(response.body.message).toBe('Email updated successfully');
        expect(response.body.user.email).toBe(newEmail);
    });

    it('handles user not found error for update-email', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const newEmail = 'newemail@example.com';

        await request('http://localhost:5000')
        .put('/api/user/update-email/' + nonExistentUserId)
        .send({ newEmail })
        .expect(404);
    });

    it('updates user first name successfully', async () => {
        await request('http://localhost:5000')
          .put(`/api/user/update-first_name/${fakeUser._id}`)
          .send({ newFirstName: 'NewFirstName' })
          .expect(200);
    });

    it('handles user not found error for update-first_name', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
    
        await request('http://localhost:5000')
            .put(`/api/user/update-first_name/${nonExistentUserId}`)
            .send({ newFirstName: 'NewFirstName' })
            .expect(404);
    
        });
    
    it('updates user last name successfully', async () => {
        await request('http://localhost:5000')
            .put(`/api/user/update-last_name/${fakeUser._id}`)
            .send({ newLastName: 'NewLastName' })
            .expect(200);
    });

    it('handles user not found error for update-last_name', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();

        await request('http://localhost:5000')
            .put(`/api/user/update-last_name/${nonExistentUserId}`)
            .send({ newLastName: 'NewLastName' })
            .expect(404);
    });

    it('deletes user successfully', async () => {
        await request('http://localhost:5000')
        .delete(`/api/user/delete/${fakeUser._id}`)
        .expect(200);
    });
    
    it('handles user not found error for delete', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();

        await request('http://localhost:5000')
            .delete(`/api/user/delete/${nonExistentUserId}`)
            .expect(404);
    });    

    afterAll((done) => {
        server.close(done);
    });
});
