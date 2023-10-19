const request = require('supertest');
const express = require('express');
const router = require('../../routes/testRoutes'); // Import your router file here
const connectDb = require('../fixtures/db');
const { signAccessToken } = require('../../helpers/token');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use('/api/test', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5022; // Choose a port for testing
const server = app.listen(PORT);

// Mocked token secret
const TOKEN_SECRET = 'test';

// Mock token secret
jest.mock('../../config/keys', () => {
	return {
		TOKEN_SECRET
	};
});

describe('Admin token verify', () => {
	let db;

	beforeAll(done => {
		done();
		db = connectDb(); // Connect to the database
	});

	it('Return an error if no valid admin token is present on private route', async () => {
		const token = 'ImAnInvalidToken';
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/test/adminOnly')
			.set('token', token)

		expect(response.body.error).toBeDefined();
	});

	it('Return success if an admin token is valid on a private route', async () => {
		const token = signAccessToken({ id: 'srdfet784y2uioejqr' });

		// mock that token is valid
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/test/adminOnly')
			.set('token', token)
			.expect(200);
	});

	it('Test for non-algorithm attack', async () => {
		const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.' + btoa(`{"id":1,"iat":${'' + Date.now()},"exp":999999999999}`) + '.';
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/test/adminOnly')
			.set('token', token)
			.expect(401);
	});

	afterAll(async () => {
		server.close();
		await mongoose.connection.close();
	});
});