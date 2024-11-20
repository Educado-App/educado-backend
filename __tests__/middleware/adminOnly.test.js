const request = require('supertest');
const express = require('express');
const router = require('../../routes/testRoutes'); 
const { signAccessToken } = require('../../helpers/token');

const app = express();
app.use(express.json());
app.use('/api/test', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5022; // Choose a port for testing
const server = app.listen(PORT);

// Mocked token secret
const TOKEN_SECRET = 'test';

// Mock token secret
jest.mock('../../config/keys', () => ({
	TOKEN_SECRET: 'test-secret'
}));

describe('Admin token verify', () => {
	let originalConsoleError;

	beforeAll(done => {
		// Suppress console.error during tests by mocking it
        originalConsoleError = console.error;
        console.error = jest.fn();
		
		done();
	});

	it('Return an error if no valid admin token is present on private route', async () => {
		const token = 'ImAnInvalidToken';
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/test/adminOnly')
			.set('token', token);

		expect(response.body.error).toBeDefined();
	});

	it('Return success if an admin token is valid on a private route', async () => {
		const token = signAccessToken({ id: 'srdfet784y2uioejqr', role: 'admin' });

		// mock that token is valid
		await request(`http://localhost:${PORT}`)
			.get('/api/test/adminOnly')
			.set('Authorization', "Bearer " + token)
			.expect(200);
	});

	it('Test for non-algorithm attack', async () => {
		const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.' + btoa(`{"id":1,"iat":${'' + Date.now()},"exp":999999999999}`) + '.';
		await request(`http://localhost:${PORT}`)
			.get('/api/test/adminOnly')
			.set('Authorization', "Bearer " + token)
			.expect(401);
	});

	afterAll(async () => {
		console.error = originalConsoleError; // Restore console.error
		
		server.close();
	});
});