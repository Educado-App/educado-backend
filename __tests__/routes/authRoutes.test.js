const request = require('supertest');
const express = require('express');
const router = require('../../routes/authRoutes'); // Import your router file here
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeContentCreator = require('../fixtures/fakeContentCreator');
const makeFakeStudent = require('../fixtures/fakeStudent');
const makeFakeResetPasswordToken = require('../fixtures/fakeResetPasswordToken');

const mongoose = require('mongoose');
const { encrypt } = require('../../helpers/password');
const { sendResetPasswordEmail } = require('../../helpers/email');

const app = express();
app.use(express.json());
app.use('/api/auth', router); // Mount the router under '/api' path

// Mock Google OAuth2 clientID
jest.mock('../../config/keys', () => {
	return {
		GOOGLE_CLIENT_ID: 'test',
		TOKEN_SECRET: 'test',
	};
});

jest.mock('../../helpers/email', () => {
	return {
		sendResetPasswordEmail: jest.fn(),
	};
});

// Start the Express app on a specific port for testing
const PORT = 5020; // Choose a port for testing
const server = app.listen(PORT);

const fakeUser = makeFakeUser();
const fakeStudent = makeFakeStudent(fakeUser._id);
let db; // Store the database connection
beforeAll(async () => {
	db = await connectDb(); // Connect to the database
});

describe('POST /auth/login', () => {

	beforeAll(async () => {
		// Insert the fake user into the database
		await db.collection('users').insertOne(fakeUser);

		// Find the newly created fake user to use their id
		const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });

		let approved = true, rejected = false;
		// Creator a Content Creator entry from the id
		const newContentCreator = makeFakeContentCreator(user._id, approved, rejected);
		await db.collection('content-creators').insertOne(newContentCreator);
   
		//Insert fake student into the database
		await db.collection('students').insertOne(fakeStudent);

	});

	it('Should find a user mail without differentiating between upper- and lowercase', async () => {

		const uppercaseMail = {
			email: 'Fake@gmail.com',
			password: 'ABC123456!'
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/login')
			.send(uppercaseMail).
			expect(202);
		// Verify the response body
		expect(response.body.userInfo.email).toBe('fake@gmail.com');
	});

	it('Returns error if user is not found', async () => {
		const nonExistingUser = {
			email: 'iDontExist@test.dk',
			password: encrypt('12345678')
		};

		// Send a Post request to the login endpoint
		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/login')
			.send(nonExistingUser)
			.expect(401);

		// Verify the response body
		expect(response.body.error.code).toBe('E0004');
	});

	it('Returns error if password is incorrect', async () => {
		const incorrectPassword = {
			email: fakeUser.email,
			password: 'incorrectPassword'
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/login')
			.send(incorrectPassword)
			.expect(401);

		// Verify the response body
		expect(response.body.error.code).toBe('E0105');
	});

	it('Returns error if Content Creator is not approved', async () => {
		const correctCredentials = {
			email: fakeUser.email,
			password: 'ABC123456!'
		};

		// Change the Content Creator data to match test specifications 
		await db.collection('content-creators').findOneAndUpdate({ baseUser: fakeUser._id }, { $set: { approved: false, rejected: false }});

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/login')
			.send(correctCredentials)
			.expect(403);

		// Verify the response body
		expect(response.body.error.code).toBe('E1001');
    
		// Reset Content Creator fields
		await db.collection('content-creators').findOneAndUpdate({ baseUser: fakeUser._id }, { $set: { approved: true, rejected: false }});
	});

	it('Returns error if Content Creator is rejected', async () => {
		const correctCredentials = {
			email: fakeUser.email,
			password: 'ABC123456!'
		};

		// Change the Content Creator data to match test specifications 
		await db.collection('content-creators').findOneAndUpdate({ baseUser: fakeUser._id }, { $set: { approved: false, rejected: true }});

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/login')
			.send(correctCredentials)
			.expect(403);

		// Verify the response body
		expect(response.body.error.code).toBe('E1002');

		// Reset Content Creator fields
		await db.collection('content-creators').findOneAndUpdate({ baseUser: fakeUser._id }, { $set: { approved: true, rejected: false }});
	});

	it('Returns error if password is incorrect', async () => {
		const incorrectPassword = {
			email: fakeUser.email,
			password: 'incorrectPassword'
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/login')
			.send(incorrectPassword)
			.expect(401);

		// Verify the response body
		expect(response.body.error.code).toBe('E0105');
	});

	it('Returns token if user is found and password is correct', async () => {
		const correctCredentials = {
			email: fakeUser.email,
			password: 'ABC123456!'
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/login')
			.send(correctCredentials)
			.expect(202);

		// Verify the response body
		expect(response.body.status).toBe('login successful');
		expect(response.body.accessToken).toBeDefined();
	});

	afterAll(async () => {
		await db.collection('users').deleteMany({});// Delete all documents in the 'users' collection
		await db.collection('content-creators').deleteMany({});// Delete all documents in the 'content-creators' collection
	});
});

describe('POST /auth/reset-password-request', () => {

	beforeAll(async () => {
		// Insert the fake user into the database
		await db.collection('users').insertOne(fakeUser);
	});

	it('Returns error if email is not found', async () => {
		const nonExistingEmail = { email: 'test@email.com' };
		const res = await request(`http://localhost:${PORT}`)
			.post('/api/auth/reset-password-request')
			.send(nonExistingEmail)
			.expect(400);

		expect(res.body.error.code).toBe('E0401');
	});

	it('Returns success if email is found and email is sent', async () => {
		sendResetPasswordEmail.mockImplementation(() => true);
		const existingEmail = { email: fakeUser.email };
		const res = await request(`http://localhost:${PORT}`)
			.post('/api/auth/reset-password-request')
			.send(existingEmail)
			.expect(200);

		expect(res.body.status).toBe('success');
	});

	it('Returns error if email is not succesfully sent', async () => {
		sendResetPasswordEmail.mockImplementation(() => false);
		const existingEmail = { email: fakeUser.email };
		const res = await request(`http://localhost:${PORT}`)
			.post('/api/auth/reset-password-request')
			.send(existingEmail)
			.expect(500);

		expect(res.body.error.code).toBe('E0004');
	});

	it('Returns error if reset password attempts > 3', async () => {
		const newFakeUser = makeFakeUser('test@user.com', [new Date(), new Date(), new Date()]); // Create a new fake user with 3 reset password attempts
		await db.collection('users').insertOne(newFakeUser);
		sendResetPasswordEmail.mockImplementation(() => true);
		const user = { email: newFakeUser.email };
		const res = await request(`http://localhost:${PORT}`)
			.post('/api/auth/reset-password-request')
			.send(user)
			.expect(400);

		expect(res.body.error.code).toBe('E0406');
	});

	it('Clears reset password attempts after expiration', async () => {
		const newFakeUser = makeFakeUser('user@test.com', [new Date() - 1000 * 60 * 5,new Date() - 1000 * 60 * 2, new Date()]);
		// Set reset password attempts to have 3 attempts with one being 5 minutes ago
		await db.collection('users').insertOne(newFakeUser);
		sendResetPasswordEmail.mockImplementation(() => true);

		const user = { email: newFakeUser.email };

		const result = await request(`http://localhost:${PORT}`)
			.post('/api/auth/reset-password-request')
			.send(user)
			.expect(400);

		expect(result.body.error.code).toBe('E0406');
	});

	it('Returns error if token is wrong', async () => {
		const fakeToken = makeFakeResetPasswordToken('6859');
		await db.collection('passwordResetTokenSchema').insertOne(fakeToken);
		const fakeCredentials = { token: fakeToken.token, email: fakeUser.email };
		sendResetPasswordEmail.mockImplementation(() => false);
		const res = await request(`http://localhost:${PORT}`)
			.post('/api/auth/reset-password-code')
			.send(fakeCredentials)
			.expect(400);

		expect(res.body.error.code).toBe('E0405');
	});

	afterAll(async () => {
		await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
	});
});

afterAll(async () => {
	await mongoose.connection.close();
	server.close();
});