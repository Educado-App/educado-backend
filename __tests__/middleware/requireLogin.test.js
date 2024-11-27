const request = require('supertest');
const express = require('express');
const router = require('../../routes/testRoutes'); 
const { signAccessToken } = require('../../helpers/token');
const { TOKEN_SECRET } = require('../../config/keys');
const { UserModel } = require('../../models/Users'); // Add this import

const app = express();
app.use(express.json());
app.use('/api/test', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5022; // Choose a port for testing
const server = app.listen(PORT);

// Mock token secret
jest.mock('../../config/keys', () => ({
	TOKEN_SECRET: 'test-secret'
}));

jest.mock('../../models/Users', () => ({
	UserModel: {
		findById: jest.fn().mockResolvedValue({ _id: 1, email: 'test@example.com' })
	}
}));

describe('JWT verify', () => {
	let originalConsoleError;

	beforeAll(done => {
		// Suppress console.error during tests by mocking it
		originalConsoleError = console.error;
		console.error = jest.fn();

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
		const token = signAccessToken({ id: 1 }, 'test-secret');

		// mock that token is valid
		const response = await request(`http://localhost:${PORT}`)
			.get('/api/test/require-jwt')
			.set('token', token)
			.expect(200);

		expect(response.body).toBeDefined(); // Verify the response body
	});

	it('Test for non-algorithm attack', async () => {
		const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.' + btoa(`{"id":1,"iat":${'' + Date.now()},"exp":999999999999}`) + '.';
		await request(`http://localhost:${PORT}`)
			.get('/api/test/require-jwt')
			.set('token', token)
			.expect(401);
	});

	afterAll(async () => {
		console.error = originalConsoleError; // Restore console.error

		await server.close(); // Ensure the server is properly closed
	});
});