const request = require('supertest');
const express = require('express');
const router = require('../../routes/utilityRoutes'); // Import your router file here
const mongoose = require('mongoose');


const app = express();
app.use(express.json());
app.use('/api/utility', router); // Add your router to the Express app

// Mock Google OAuth2 clientID
jest.mock('../../config/keys', () => {
    return {
        GOOGLE_CLIENT_ID: 'test',
        TOKEN_SECRET: 'test',
    };
});

// Start the Express app on a specific port for testing
const PORT = 5021; // Choose a port for testing
const server = app.listen(PORT)


describe('Test online response', () => {

    it('Test if online', async () => {
        const response = await request(`http://localhost:${PORT}`)
            .get('/api/utility/online')
            .expect(200);
        expect(response.body).toBe(true);

    });

});

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});
