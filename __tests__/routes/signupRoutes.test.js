const request = require('supertest');
const express = require('express');
const router = require('../../routes/authRoutes');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const mongoose = require('mongoose');


const app = express();
app.use(express.json());
app.use('/api/auth', router); // Mount the router under '/api/signup' path

// Start the Express app on a specific port for testing
const PORT = 5021; // Choose a port for testing
const server = app.listen(PORT);

// Create a fake user
let fakeUser = makeFakeUser();



describe('POST auth/signup', () => {

	let db; // Store the database connection

	const userInput = {
		firstName: 'test user',
		lastName: 'test user',
		email: 'test@email.com',
		password: 'ABC123456!',
	};

	beforeAll(async () => {
		db = await connectDb(); // Connect to the database

		// Insert the fake user into the database
		await db.collection('users').insertOne(fakeUser);
	});

	it('Saves the user in the database', async () => {
		await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(userInput)
			.expect(201);

		// Verify that the user was saved in the database
		const user = await db.collection('users').findOne({ email: userInput.email });
		expect(user).toBeDefined();
		expect(user.email).toBe(userInput.email);
	});


	it('Returns error if email is missing', async () => {
		userInput.email = '';
		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(userInput)
			.expect(400);

		expect(response.body.error.code).toBe('E0208');
	});


	it('Returns error if password is missing', async () => {
		const input = {
			firstName: 'test user',
			lastName: 'test user',
			email: fakeUser.email
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(input)
			.expect(400);
		
		expect(response.body.error.code).toBe('E0212');
	});


	it('Returns error if email does not contain @ and domain', async () => {
		const input = {
			firstName: 'test user',
			lastName: 'test user',
			email: 'testcase',
			password: 'abc123456!',
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(input)
			.expect(400);

		expect(response.body.error.code).toBe('E0206');
	});


	it('Returns error if email is less than 6 characters', async () => {
		const input = {
			firstName: 'test user',
			lastName: 'test user',
			email: 'd@d.d',
			password: 'abc123456!',
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(input)
			.expect(400);

		expect(response.body.error.code).toBe('E0207');
	});


	it('Returns error if name is missing', async () => {
		const input = {
			email: 'test@test.dk',
			password: 'abc123456!',
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(input)
			.expect(400);

		expect(response.body.error.code).toBe('E0209');
	});

	it('Returns error if name is out of bounds (1-50)', async () => {
		const input = {
			firstName: 'testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest',
			lastName: 'testtesstteststtesttesttesttesttesttesttesttesttesttesttesttestteststtesttesttesttesttesttesttesttesttesttesttesttestteststtesttesttesttesttestte',
			email: 'test@test.dk',
			password: 'abc123456!',
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(input)
			.expect(400);

		expect(response.body.error.code).toBe('E0210');
	});


	it('Returns error if name contains illegal symbols', async () => {
		const input = {
			firstName: 'test 😭😭😭',
			lastName: 'test 😭😭😭',
			email: 'test@test.dk',
			password: 'abc123456!',
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(input)
			.expect(400);

		expect(response.body.error.code).toBe('E0211');
	});


	it('Test that the password is not stored as plain text', async () => {
		const input = {
			firstName: 'hejsa',
			lastName: 'med digsa',
			email: 'test@test.dk',
			password: 'abc123456!',
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(input);
      
		expect(response.status).toBe(201);

		// Verify that the password is not stored as plain text
		const user = await db.collection('users').findOne({ email: input.email });
		expect(user.password).not.toBe(input.password);
	});


	it('Test that emails must be unique when registering', async () => {
		const input = {
			firstName: 'test',
			lastName: 'test',
			email: fakeUser.email,
			password: 'abc123456!',
		};

		const response = await request(`http://localhost:${PORT}`)
			.post('/api/auth/signup')
			.send(input)
			.expect(400);

		expect(response.body.error.code).toBe('E0201');
	});

	afterAll(async () => {
		await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
		server.close();
		await mongoose.connection.close();
	});
});
