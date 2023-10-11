const request = require('supertest');
const express = require('express');
const router = require('../../routes/userRoutes');
const connectDb = require('../fixtures/db')
const makeFakeUser = require('../fixtures/fakeUser')
const { signAccessToken } = require('../../helpers/token');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use('/api/user', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5023; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

// Mocked token secret
const TOKEN_SECRET = 'test';

// Mock token secret
jest.mock('../../config/keys', () => {
	return {
		TOKEN_SECRET
	};
});

function generateValidToken() {
    const token = signAccessToken({ id: 1 }); // Generate a token with the user ID
    return token;
  }

const fakeUser = makeFakeUser();

describe('Update User Email Route', () => {
    let db;
    let token = generateValidToken();

    beforeAll(async () => {
		db = await connectDb(); // Connect to the database
	});

    beforeEach(async () => {
        // Insert the fake user into the database before each test
        await db.collection('users').insertOne(fakeUser);
        // Generate a valid token for each test
        token = signAccessToken({ id: 1 });
    });

    afterEach(async () => {
        // Remove the user from the database after each test
        await db.collection('users').deleteOne({ _id: fakeUser._id });
      });

    it('deletes a user successfully', async () => {
        // Delete the user using the API
        await request(`http://localhost:${PORT}`)
          .delete(`/api/user/delete/${fakeUser._id}`)
          .set('token', token) // Include the token in the request headers
          .expect(200);
      
        // Verify that the user was deleted from the database
        const user = await db.collection('users').findOne({ _id: fakeUser._id });
        expect(user).toBeNull();
    });  

    it('handles user not found error for delete', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();

        await request(`http://localhost:${PORT}`)
            .delete(`/api/user/delete/${nonExistentUserId}`)
            .set('token', token) // Include the token in the request headers
            .expect(204);
    });

    it('updates user email successfully', async () => {
        const newEmail = 'newemail@example.com';

        await request(`http://localhost:${PORT}`)
            .put('/api/user/update-email/' + fakeUser._id)
            .set('token', token) // Include the token in the request headers
            .send({ newEmail })
            .expect(200);

        // Verify that the user was saved in the database
		const user = await db.collection('users').findOne({ email: newEmail });
		expect(user).toBeDefined();
		expect(user.email).toBe(newEmail);
    });

    it('Test that emails must be unique when updating', async () => {
        const newEmail = fakeUser.email;

        const response = await request(`http://localhost:${PORT}`)
            .put('/api/user/update-email/' + fakeUser._id)
            .set('token', token) // Include the token in the request headers
            .send({ newEmail })
            .expect(400);

            expect(response.body.error.code).toBe('E0201');
    });

    it('handles user not found error for update-email', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const newEmail = 'newemail@example.com';

        await request(`http://localhost:${PORT}`)
            .put('/api/user/update-email/' + nonExistentUserId)
            .set('token', token) // Include the token in the request headers
            .send({ newEmail })
            .expect(204);
    });

    it('updates user first name successfully', async () => {
        const newFirstName = 'NewFirstName';

        await request(`http://localhost:${PORT}`)
            .put(`/api/user/update-first-name/${fakeUser._id}`)
            .set('token', token) // Include the token in the request headers
            .send({ newFirstName: newFirstName })
            .expect(200);

        // Verify that the user was saved in the database
		const user = await db.collection('users').findOne({ firstName: newFirstName });
		expect(user).toBeDefined();
		expect(user.firstName).toBe(newFirstName);
    });

    it('handles user not found error for update-first-name', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
    
        await request(`http://localhost:${PORT}`)
            .put(`/api/user/update-first-name/${nonExistentUserId}`)
            .set('token', token) // Include the token in the request headers
            .send({ newFirstName: 'NewFirstName' })
            .expect(204);
        });
    
    it('updates user last name successfully', async () => {
        const newLastName = 'NewLastName';

        await request(`http://localhost:${PORT}`)
            .put(`/api/user/update-last-name/${fakeUser._id}`)
            .set('token', token) // Include the token in the request headers
            .send({ newLastName: newLastName })
            .expect(200);
        
        // Verify that the user was saved in the database
		const user = await db.collection('users').findOne({ lastName: newLastName });
		expect(user).toBeDefined();
		expect(user.lastName).toBe(newLastName);
    });

    it('handles user not found error for update-last-name', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();

        await request(`http://localhost:${PORT}`)
            .put(`/api/user/update-last-name/${nonExistentUserId}`)
            .set('token', token) // Include the token in the request headers
            .send({ newLastName: 'NewLastName' })
            .expect(204);
    });

    afterAll(async () => {
		db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
		server.close();
		await mongoose.connection.close();
	});
});
