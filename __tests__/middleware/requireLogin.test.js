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
jest.mock('../../config/keys', () => {
	return {
		TOKEN_SECRET
	};
});

describe('JWT verify', () => {

	beforeAll(done => {
		done();
	});

	it('Return an error if no valid JWT is present on private route', async () => {
		const token = 'ImAnInvalidToken';
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/test/require-jwt')
			.set('token', token)
			.expect(401);

		expect(response.body.error).toBeDefined();
	});

	it('Return success if a token is valid on a private route', async () => {
		const token = signAccessToken({ id: 1 });

		// mock that token is valid
		await request(`http://localhost:${PORT}`)
			.get('/api/test/require-jwt')
			.set('token', token)
			.expect(200);
	});

	it('Test for non-algorithm attack', async () => {
		const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.' + btoa(`{"id":1,"iat":${'' + Date.now()},"exp":999999999999}`) + '.';
		await request(`http://localhost:${PORT}`)
			.get('/api/test/require-jwt')
			.set('token', token)
			.expect(401);
	});

	afterAll(async () => {
		await server.close();
	});
});