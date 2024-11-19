const request = require('supertest');
const express = require('express');
const router = require('../../routes/userRoutes');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeStudent = require('../fixtures/fakeStudent');
const { signAccessToken } = require('../../helpers/token');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use('/api/users', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5023; // Choose a port for testing
const server = app.listen(PORT);

// Mocked token secret
const TOKEN_SECRET = 'test';

// make fake course
let fakeCourse = makeFakeCourse();

// Mock token secret
jest.mock('../../config/keys', () => {
	return {
		TOKEN_SECRET: TOKEN_SECRET,
	};
});

describe('Users Routes', () => {
	let token, adminToken, fakeUser, db, actualUser, fakeStudent;

	beforeAll(async () => {
		db = await connectDb(); // Connect to the database
		await db.collection('courses').insertOne(fakeCourse);
	});

	beforeEach(async () => {
		// Insert the fake user into the database before each test
		fakeUser = makeFakeUser();

		await db.collection('users').insertOne(fakeUser);
		actualUser = await db.collection('users').findOne({ email: fakeUser.email });

		fakeStudent = makeFakeStudent(actualUser._id);
		await db.collection('students').insertOne(fakeStudent);

		await db.collection('students').findOne({ baseUser: actualUser._id });
		token = signAccessToken({ id: actualUser._id, role: "user" });

		const fakeAdminId = new mongoose.Types.ObjectId()
		adminToken = signAccessToken({ id: fakeAdminId, role: "admin" });
	});

	afterEach(async () => {
		// Remove the user from the database after each test
		await db.collection('users').deleteOne({ _id: actualUser._id });
	});

	describe('PATCH /users/:userId', () => {
		it('Updates user email successfully', async () => {
			const newEmail = 'newemail@example.com';

			await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id)
				.set('token', token) // Include the token in the request headers
				.send({ email: newEmail })
				.expect(200); // Expecting a 200 OK response

			// Verify that the user was saved in the database
			const user = await db.collection('users').findOne({ _id: actualUser._id });
			expect(user).toBeDefined();
			expect(user.email).toBe(newEmail);
		});

		it('Checks that emails must be unique when updating', async () => {
			const newEmail = fakeUser.email;

			const response = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id)
				.set('token', token) // Include the token in the request headers
				.send({ email: newEmail })
				.expect(400); // Expecting a 400 Bad Request response

			expect(response.body.error.code).toBe('E0201');
		});

		/*it('handles user not found error for update-email', async () => {
			const nonExistentUserId = new mongoose.Types.ObjectId();
			const newEmail = 'newemail@example.com';

			await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + nonExistentUserId)
				.set('token', token) // Include the token in the request headers
				.send({ email: newEmail })
				.expect(204); // Expecting a 204 No Content response for user not found
		});*/

		it('Updates user first name successfully', async () => {
			const newFirstName = 'newFirstName';

			await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id)
				.set('token', token) // Include the token in the request headers
				.send({ firstName: newFirstName })
				.expect(200); // Expecting a 200 OK response

			// Verify that the user was saved in the database
			const user = await db.collection('users').findOne({ _id: actualUser._id });
			expect(user).toBeDefined();
			expect(user.firstName).toBe(newFirstName);
		});

		/*it('handles user not found error for update-first-name', async () => {
			const nonExistentUserId = new mongoose.Types.ObjectId();

			await request(`http://localhost:${PORT}`)
				.patch(`/api/users/${nonExistentUserId}`)
				.set('token', token) // Include the token in the request headers
				.send({ newFirstName: 'NewFirstName' })
				.expect(204);
		});*/

		it('Updates user last name successfully', async () => {
			const newLastName = 'newLastName';

			await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id)
				.set('token', token) // Include the token in the request headers
				.send({ lastName: newLastName })
				.expect(200); // Expecting a 200 OK response

			// Verify that the user was saved in the database
			const user = await db.collection('users').findOne({ _id: actualUser._id });
			expect(user).toBeDefined();
			expect(user.lastName).toBe(newLastName);
		});

		/*it('handles user not found error for update-last-name', async () => {
			const nonExistentUserId = new mongoose.Types.ObjectId();

			await request(`http://localhost:${PORT}`)
				.patch(`/api/users/${nonExistentUserId}`)
				.set('token', token) // Include the token in the request headers
				.send({ newLastName: 'NewLastName' })
				.expect(204);
		});*/

		it('Updates user fields successfully', async () => {
			const newEmail = 'newemail@example.com';
			const newFirstName = 'Jane';

			await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id)
				.set('token', token) // Include the token in the request headers
				.send({
					email: newEmail,
					firstName: newFirstName
				})
				.expect(200); // Expecting a 200 OK response

			// Verify that the user was updated in the database
			const updatedUser = await db.collection('users').findOne({ _id: actualUser._id });
			expect(updatedUser.email).toBe(newEmail);
			expect(updatedUser.firstName).toBe(newFirstName);
		});

		/*it('handles user not found error', async () => {
			const nonExistentUserId = new mongoose.Types.ObjectId();
			const newEmail = 'newemail@example.com';

			await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + nonExistentUserId)
				.set('token', token) // Include the token in the request headers
				.send({
					email: newEmail
				})
				.expect(204); // Expecting a 204 No Content response for user not found
		});*/

		it('Handles validation errors for email', async () => {
			const invalidEmail = 'invalidemail'; // Invalid email format

			const response = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id)
				.set('token', token) // Include the token in the request headers
				.send({
					email: invalidEmail
				})
				.expect(400); // Expecting a 400 Bad Request response

			expect(response.body.error.code).toBe('E0206');
		});

		it('Handles validation errors for first name', async () => {
			const invalidFirstName = 'AASD!==#¤("DSN:_;>:'; // Invalid email format

			const response = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id)
				.set('token', token) // Include the token in the request headers
				.send({
					firstName: invalidFirstName
				})
				.expect(400); // Expecting a 400 Bad Request response

			expect(response.body.error.code).toBe('E0211');
		});
	
		it('Should change user credentials', async () => {
			const user = await db.collection('users').findOne({ email: fakeUser.email });

			await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + user._id)
				.set('token', token) // Include the token in the request headers
				.send({
					email: 'newEmail@email.com',
					firstName: 'newFirstName',
					lastName: 'newLastName',
				})
				.expect(200); // Expecting a 200 OK response

			const updatedUser = await db.collection('users').findOne({ _id: user._id });

			expect(updatedUser).toMatchObject({
				firstName: 'newFirstName',
				lastName: 'newLastName',
				email: 'newEmail@email.com',
				password: expect.any(String),
				joinedAt: user.joinedAt,
				resetAttempts: user.resetAttempts,
				dateUpdated: expect.any(Date),
			});
		});

		it('Return error if trying to edit password', async () => {
			const user = await db.collection('users').findOne({ email: fakeUser.email });

			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + user._id)
				.set('token', token) // Include the token in the request headers
				.send({ password: '12345678' })
				.expect(400); // Expecting a 400 response

			expect(res.body.error.code).toBe('E0803');
		});

		it('Return error if there is an attempt to update an illegal field name', async () => {
			const user = await db.collection('users').findOne({ email: fakeUser.email });

			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + user._id)
				.set('token', token) // Include the token in the request headers
				.send({ dateCreated: Date.now() })
				.expect(400); // Expecting a 400 response

			expect(res.body.error.code).toBe('E0801');
		});

		it('Return succesful updated object with new dateUpdated value ', async () => {
			// wait 1 second to make sure dateUpdated is not the same
			await new Promise(resolve => setTimeout(resolve, 1000));
			const user = await db.collection('users').findOne({ email: fakeUser.email });

			await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + user._id)
				.set('token', token) // Include the token in the request headers
				.send({
					email: 'hej@hej.dk'
				})
				.expect(200); // Expecting a 200 OK response

			const updatedUser = await db.collection('users').findOne({ _id: user._id });
			expect(updatedUser.dateUpdated - 0).not.toBe(user.dateUpdated - 0);
		});

		it('Return error if email you try to PATCH is identical', async () => {
			const user = await db.collection('users').findOne({ email: fakeUser.email });

			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + user._id)
				.set('token', token) // Include the token in the request headers
				.send({ email: fakeUser.email })
				.expect(400); // Expecting a 400 response

			expect(res.body.error.code).toBe('E0201');
		});

		it('Return error if firstName you try to PATCH is identical', async () => {
			const user = await db.collection('users').findOne({ email: fakeUser.email });

			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + user._id)
				.set('token', token) // Include the token in the request headers
				.send({ firstName: fakeUser.firstName })
				.expect(400); // Expecting a 400 response

			expect(res.body.error.code).toBe('E0802');
		});
	});

	describe('PATCH /api/users/:userId/password', () => {
		it('Should change password', async () => {
			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id + '/password')
				.set('token', token) // Include the token in the request headers
				.send({ oldPassword: 'ABC123456!', newPassword: 'newPassword' });

			expect(res.status).toBe(200);
			const updatedUser = await db.collection('users').findOne({ _id: actualUser._id });
			expect(updatedUser.password).not.toBe(actualUser.password);
		});

		it('Should return error if old password is wrong', async () => {
			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id + '/password')
				.set('token', token) // Include the token in the request headers
				.send({ oldPassword: 'wrongPassword', newPassword: 'newPassword' });

			expect(res.status).toBe(400);
			expect(res.body.error.code).toBe('E0806');
		});

		it('Should return error if new password is invalid', async () => {
			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id + '/password')
				.set('token', token) // Include the token in the request headers
				.send({ oldPassword: 'ABC123456!', newPassword: 'new' });

			expect(res.status).toBe(400);
			expect(res.body.error.code).toBe('E0213');
		});

		it('Should return error if new password is missing', async () => {
			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/' + actualUser._id + '/password')
				.set('token', token) // Include the token in the request headers
				.send({ oldPassword: 'ABC123456!' });

			expect(res.status).toBe(400);
			expect(res.body.error.code).toBe('E0805');
		});

		it('Should return error if user is not owner', async () => {
			const res = await request(`http://localhost:${PORT}`)
				.patch('/api/users/invalidId/password')
				.set('token', token) // Include the token in the request headers
				.send({ oldPassword: 'ABC123456!', newPassword: 'newPassword' });

			expect(res.status).toBe(401);
			expect(res.body.error.code).toBe('E0002');
		});

	});

	describe('GET /api/users/:userId', () => {
		it('Should return a user with the given id', async () => {
			const res = await request(`http://localhost:${PORT}`)
				.get('/api/users/' + actualUser._id)
				.set('token', token) // Include the token in the request headers
				.expect(200);

			expect(res.body).toMatchObject({
				_id: actualUser._id.toString(),
				firstName: actualUser.firstName,
				lastName: actualUser.lastName,
				email: actualUser.email,
				joinedAt: actualUser.joinedAt.toISOString(),
				resetAttempts: actualUser.resetAttempts,
				dateUpdated: actualUser.dateUpdated.toISOString(),
			});
		});

		it('Should return error if user is not owner', async () => {
			const res = await request(`http://localhost:${PORT}`)
				.get('/api/users/invalidId')
				.set('token', token) // Include the token in the request headers
				.expect(401);

			expect(res.body.error.code).toBe('E0002');
		});

	});

	afterAll(async () => {
		await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
		await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
		await db.collection('sections').deleteMany({}); // Delete all documents in the 'courses' collection
		await db.collection('exercises').deleteMany({}); // Delete all documents in the 'courses' collection
		await db.collection('content-creators').deleteMany({}); // Delete all documents in the 'courses' collection
		await db.collection('students').deleteMany({}); // Delete all documents in the 'courses' collection
		server.close();
		await mongoose.connection.close();
	});
});