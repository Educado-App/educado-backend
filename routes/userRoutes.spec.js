const request = require('supertest');
const express = require('express');
const router = require('../routes/userRoutes');
const connectDb = require('../__tests__/fixtures/db')
const makeFakeUser = require('../__tests__/fixtures/fakeUser')
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
    req.user = { id: 'mockUserId', /* Needs this for requireLogin middleware */ };
    next();
  });

app.use('/api/user', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5000; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

const fakeUser = makeFakeUser();

describe('Update User Email Route', () => {

    let db;

    beforeAll(async () => {
        db = await connectDb(); // Connect to the database

        await db.collection('users').insertOne(fakeUser);
    });

    it('updates user email successfully', async () => {
        const newEmail = 'newemail@example.com';

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
        const response = await request('http://localhost:5000')
            .put(`/api/user/update-first_name/${fakeUser._id}`)
            .send({ newFirstName: 'NewFirstName' })
            .expect(200);

        expect(response.body.message).toBe('First name updated successfully');
        expect(response.body.user.firstName).toBe('NewFirstName');
    });

    it('handles user not found error for update-first_name', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
    
        await request('http://localhost:5000')
            .put(`/api/user/update-first_name/${nonExistentUserId}`)
            .send({ newFirstName: 'NewFirstName' })
            .expect(404);
        });
    
    it('updates user last name successfully', async () => {
        const response = await request('http://localhost:5000')
            .put(`/api/user/update-last_name/${fakeUser._id}`)
            .send({ newLastName: 'NewLastName' })
            .expect(200);
        
        expect(response.body.message).toBe('Last name updated successfully');
        expect(response.body.user.lastName).toBe('NewLastName');
    });

    it('handles user not found error for update-last_name', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();

    await request('http://localhost:5000')
        .put(`/api/user/update-last_name/${nonExistentUserId}`)
        .send({ newLastName: 'NewLastName' })
        .expect(404);
    });

    afterAll((done) => {
        server.close(done);
    });
});
