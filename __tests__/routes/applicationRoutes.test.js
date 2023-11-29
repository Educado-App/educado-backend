const request = require('supertest');
const express = require('express');
const router = require('../../routes/applicationRoutes');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeApplication = require('../fixtures/fakeApplication');
const makeFakeContentCreator = require('../fixtures/fakeContentCreator');
const app = express();
app.use(express.json());
app.use('/api/application', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5019; // Choose a port for testing
const server = app.listen(PORT, () => {
});

//mock user
const newUser = makeFakeUser();


describe('Application Routes', () => {
	let db; // Store the database connection

	beforeAll(async () => {
		db = await connectDb(); // Connect to the database
	});

	beforeEach(async () => {
		await db.collection('users').insertOne(newUser);
		const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
		let approved = false, rejected = false;
		const newContentCreator = makeFakeContentCreator(user._id, approved, rejected);
		await db.collection('content-creators').insertOne(newContentCreator);
    
	});

	afterEach(async () => {
		await db.collection('users').deleteMany({});
		await db.collection('content-creators').deleteMany({});
		await db.collection('applications').deleteMany({});
	});

	afterAll(async () => {
		await server.close();
		await mongoose.connection.close();
	});

	// Test GET request
	describe('GET /api/application/:id', () => {
		it('Should get user data by ID', async () => {
			const fakeId = newUser._id;
			const response = await request(app)
				.get(`/api/application/${fakeId}`)
				.expect('Content-Type', /json/)
				.expect(200);

			expect(response.body).toHaveProperty('success', true);
		});
	});

	// Test POST request
	describe('POST /api/application/newapplication', () => {
		it('Should create a new application', async () => {

			const newApplication = makeFakeApplication(newUser._id);
			const response = await request(app)
				.post('/api/application/newapplication')
				.send(newApplication)
				.expect(201);

			expect(response.body).toHaveProperty('application');
		});
	});

	//Test PUT requests
	describe('PUT /api/application/newapplication', () => {
		it('Should reject an application', async () => {
			const fakeId = newUser._id;

			await request(app)
				.put(`/api/application/${fakeId}reject`)
				.expect(200);
      
			const updatedNewContentCreator = await db.collection('content-creators').findOne({ baseUser: fakeId });
			expect(updatedNewContentCreator.rejected).toBe(true);
		});

		it('Should approve an application', async () => {
			const fakeId = newUser._id;

			await request(app)
				.put(`/api/application/${fakeId}approve`)
				.expect(200);

			const updatedNewContentCreator = await db.collection('content-creators').findOne({ baseUser: fakeId });
			expect(updatedNewContentCreator.approved).toBe(true);
		});
	});
});
 