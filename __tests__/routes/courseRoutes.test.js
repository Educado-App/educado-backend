const request = require('supertest');
const express = require('express');
const router = require('../../routes/courseRoutes');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeSection = require('../fixtures/fakeSection');
const { signAccessToken } = require('../../helpers/token');
const errorCodes = require('../../helpers/errorCodes');
const makeFakeCreator = require('../fixtures/fakeContentCreator');
const makeFakeStudent = require('../fixtures/fakeStudent');
const makeFakeLecture = require('../fixtures/fakeLecture');
const makeFakeExercise = require('../fixtures/fakeExercise');
const makeFakeCoursePublished = require('../fixtures/fakeCoursePublished');
const makeFakeFeedbackOptions = require('../fixtures/fakeFeedbackOptions');
const { getFakeCourses, getFakeCoursesByCreator } = require('../fixtures/fakeCourses');
const { addIncompleteCourse } = require('../../helpers/completing');

const app = express();
app.use(express.json());
app.use('/api/courses', router); // Mount the router under '/api' path

// Mock Google OAuth2 clientID
jest.mock('../../config/keys', () => {
	return {
		GOOGLE_CLIENT_ID: 'test',
		TOKEN_SECRET: 'test',
	};
});

// Start the Express app on a specific port for testing
const PORT = 5021; // Choose a port for testing
const ADMIN_ID = 'srdfet784y2uioejqr';
const server = app.listen(PORT, () => {
});

// Create a fake user, course and section
let fakeUser = makeFakeUser();
let fakeCreator;
let fakeStudent;
let fakeCourse = makeFakeCourse();
let fakeSection = makeFakeSection();
let fakeCourses = getFakeCourses();
let fakeLection = makeFakeLecture();
let fakeExercise = makeFakeExercise();
let fakeCoursePublished = makeFakeCoursePublished();
let fakeFeedbackOptions = makeFakeFeedbackOptions();


const COMP_TYPES = {
	LECTURE: 'lecture',
	EXERCISE: 'exercise',
};

describe('Course Routes', () => {

	let db, actualUser; // Store the database connection

	beforeAll(async () => {
		db = await connectDb(); // Connect to the database
	});

	beforeEach(async () => {
		// Insert the fake user, courses and sections into the database
		await db.collection('users').insertOne(fakeUser);
		await db.collection('courses').insertOne(fakeCourse);
		await db.collection('sections').insertOne(fakeSection);
		await db.collection('lectures').insertOne(fakeLection);
		await db.collection('exercises').insertOne(fakeExercise);
		await db.collection('feedbackoptions').insertMany(fakeFeedbackOptions);

		actualUser = await db.collection('users').findOne({ email: fakeUser.email });
		fakeCreator = makeFakeCreator(actualUser._id);
		fakeStudent = makeFakeStudent(actualUser._id);
		await db.collection('content-creators').insertOne(fakeCreator);
		await db.collection('students').insertOne(fakeStudent);
	});

	afterEach(async () => {
		await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
		await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
		await db.collection('sections').deleteMany({}); // Delete all documents in the 'sections' collection
		await db.collection('content-creators').deleteMany({}); // Delete all documents in the 'content-creators' collection
		await db.collection('students').deleteMany({}); // Delete all documents in the 'students' collection
		await db.collection('lectures').deleteMany({}); // Delete all documents in the 'lectures' collection
		await db.collection('exercises').deleteMany({}); // Delete all documents in the 'exercises' collection
		await db.collection('feedbackoptions').deleteMany({}); 
	});

	afterAll(async () => {
		await server.close();
		await mongoose.connection.close();
	});

	describe('GET /courses/:courseId', () => {

		it('Should get a specific course', async () => {
			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId);

			expect(response.status).toBe(200);
			expect(response.body).toBeInstanceOf(Object);
			expect(response.body._id.toString()).toBe(courseId.toString());
		});

		it('Should handle course not found error', async () => {

			// create non existing courseId
			const ObjectId = mongoose.Types.ObjectId;
			const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

			// simulate a request for a non-existent course
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId);

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0006');
		});


		it('Should handle invalid course id', async () => {

			// simulate a request with invalid course id
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/this-is-an-invalid-courseId');

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0014');
		});
	});

	describe('GET /courses/:courseId/sections', () => {
		it('Should get all sections from a course', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			const section = await db.collection('sections').findOne({ title: 'test section' });
			const sectionId = section._id;

			// add section to the course sections array
			const resultCourse = await db.collection('courses').findOneAndUpdate(
				{ _id: courseId },
				{ $push: { sections: sectionId } },
				{ returnDocument: 'after' } // 'after' returns the updated document
			);
			const updatedCourse = resultCourse.value;

			// Check if the section was successfully added
			expect(updatedCourse.sections.find((element) => element == sectionId));

			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId + '/sections');

			expect(response.status).toBe(200);
			expect(response.body).toBeInstanceOf(Array);
		});

		it('Should handle course not found error', async () => {

			// create non existing courseId
			const ObjectId = mongoose.Types.ObjectId;
			const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

			// simulate a request for a non-existent course
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId + '/sections');

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0006');
		});


		it('Should handle invalid course id', async () => {

			// simulate a request with invalid course id
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/this-is-an-invalid-courseId/sections');

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0014');
		});
		// error handling for no sections will be tested in the bottom
	});

	describe('GET /courses/:courseId/sections/:sectionId', () => {

		it('Should get a specific section', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			const section = await db.collection('sections').findOne({ title: 'test section' });
			const sectionId = section._id;

			// Find the course and update its sections
			const resultCourse = await db.collection('courses').findOneAndUpdate(
				{ _id: courseId },
				{ $push: { sections: sectionId } },
				{ returnDocument: 'after' } // 'after' returns the updated document
			);
			const updatedCourse = resultCourse.value;

			// update the section to have course as parent course:
			const resultSection = await db.collection('sections').findOneAndUpdate(
				{ _id: sectionId },
				{ $set: { parentCourse: courseId } },
				{ returnDocument: 'after' } // 'after' returns the updated document
			);
			const updatedSection = resultSection.value;

			// Check if the section was successfully added
			expect(updatedCourse.sections.find((element) => element == sectionId));
			// Check that parentCourse was successfully added
			expect(updatedSection.parentCourse).toEqual(courseId);

			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId + '/sections/' + sectionId);

			expect(response.status).toBe(200);
			expect(response.body).toBeInstanceOf(Object);
		});

		it('Should handle course not found error', async () => {

			const section = await db.collection('sections').findOne({ title: 'test section' });
			const sectionId = section._id;

			// create non existing courseId
			const ObjectId = mongoose.Types.ObjectId;
			const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

			// simulate a request for a non-existent course
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId + '/sections/' + sectionId);

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0006');
		});

		it('Should handle invalid course id', async () => {

			const section = await db.collection('sections').findOne({ title: 'test section' });
			const sectionId = section._id;

			// simulate a request for a non-existent course
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/this-is-an-invalid-courseId/sections/' + sectionId);

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0014');
		});

		it('Should handle section not found error', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			// create non existing courseId
			const ObjectId = mongoose.Types.ObjectId;
			const sectionId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

			// simulate a request for a non-existent course
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId + '/sections/' + sectionId);

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0008');
		});

		it('Should handle invalid section id', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			// simulate a request for a non-existent course
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId + '/sections/this-is-an-invalid-sectionId');

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0014');
		});
	});

	describe('GET /courses/:courseId/sections, error handling', () => {

		it('Should handle course does not contain sections', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			const resultCourse = await db.collection('courses').findOneAndUpdate(
				{ _id: courseId },
				{ $set: { sections: [] } },
				{ returnDocument: 'after' } // 'after' returns the updated document
			);
			const updatedCourse = resultCourse.value;

			expect(updatedCourse.sections).toHaveLength(0);


			// send request where there the course does not have sections
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId + '/sections');

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0009');

		});

		it('Should handle sections not found', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			const section = await db.collection('sections').findOne({ title: 'test section' });
			const sectionId = section._id;

			// delete all sectionsn
			await db.collection('sections').deleteMany({});

			// add section to the course sections array
			const resultCourse = await db.collection('courses').findOneAndUpdate(
				{ _id: courseId },
				{ $push: { sections: sectionId } },
				{ returnDocument: 'after' } // 'after' returns the updated document
			);
			const updatedCourse = resultCourse.value;

			// Check if the section was successfully added
			expect(updatedCourse.sections.find((element) => element == sectionId));

			// send request where there are no sections in db that match the course's sections
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/' + courseId + '/sections');

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0007');
		});
	});

	describe('POST /courses/:courseId/subscribe', () => {
		it('Should subscribe a user to a course', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			const user = await db.collection('students').findOne({ baseUser: actualUser._id });

			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + courseId + '/subscribe')
				.send({ user_id: user.baseUser });

			const updatedUser = await db.collection('students').findOne({ baseUser: actualUser._id });
			expect(response.status).toBe(200);
			expect(response.body).toBeInstanceOf(Object);
			expect(updatedUser.subscriptions.find((element) => element == courseId));
			expect(updatedUser.courses.find((element) => element.courseId == courseId));
		});

		it('add incomplete course when subbing', async () => {
			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;
      
			const obj = await addIncompleteCourse(course);

			expect(obj).toBeInstanceOf(Object);
			expect(obj.courseId).toEqual(courseId);
		});

		it('Should handle user not found error when subscribing', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			// create non existing user id
			const ObjectId = mongoose.Types.ObjectId;
			const userId = new ObjectId('5f841c2b1c8cfb2c58b78d66');

			// Simulate a request to unsubscribe with an non existing user id
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + courseId + '/subscribe')
				.send({ user_id: userId });


			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0004');
		});

		it('Should handle invalid user id when subscribing', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			// Simulate a request to unsubscribe with an invalid user id
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + courseId + '/subscribe')
				.send({ user_id: 'this-is-an-invalid-userId' });

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0014');
		});

		it('Should handle course not found error when subscribing', async () => {

			const user = await db.collection('students').findOne({ baseUser: actualUser._id });
			const userId = user.baseUser;

			// create non existing courseId
			const ObjectId = mongoose.Types.ObjectId;
			const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

			// Simulate a request to unsubscribe with an invalid user id
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + courseId + '/subscribe')
				.send({ user_id: userId });

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0006');
		});

		it('Should handle invalid course id when subscribing', async () => {

			const user = await db.collection('students').findOne({ baseUser: actualUser._id });
			const userId = user._id;

			// Simulate a request to unsubscribe with an invalid user id
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/this-is-aninvalid-courseId/subscribe')
				.send({ user_id: userId });

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0014');
		});

		it('Increments number of subscribers for a course, when subscribing', async () => {
			// find a course
			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			// find the first user
			const user = await db.collection('students').findOne({ baseUser: actualUser._id });
			const userId = user.baseUser;

			// make first user subscribe to a course
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + course._id + '/subscribe')
				.send({ user_id: userId });
			// check the post request is successful
			expect(response.status).toBe(200);

			// check the number of subscribers is incremented
			const updatedCourse = await db.collection('courses').findOne({ _id: courseId });
			const updatedUser = await db.collection('students').findOne({ baseUser: actualUser._id });
			expect(updatedCourse.numOfSubscriptions).toBe(1);
			expect(updatedUser.subscriptions).toHaveLength(1);
			expect(updatedUser.subscriptions.find((element) => element == courseId));
		});

		it('Should handle user already subscribed error', async () => {
			// find a course
			const course = await db.collection('courses').findOne({ title: 'test course' });

			// find the first user
			const user = await db.collection('students').findOne({ baseUser: actualUser._id });

			// make user subscribe to a course
			const response1 = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + course._id + '/subscribe')
				.send({ user_id: user.baseUser });
			expect(response1.status).toBe(200);

			// make user subscribe to the course again
			const response2 = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + course._id + '/subscribe')
				.send({ user_id: user.baseUser });
			expect(response2.status).toBe(400);
			// Cannot subscribe to course: User is already subscribed to course
			expect(response2.body.error.code).toBe('E0605');
		});
	});
	describe('POST /courses/:courseId/unsubscribe', () => {
		it('Error when unsubscribing to course with no subscriptions', async () => {
			const course = await db.collection('courses').findOne({ title: fakeCourse.title });
			const courseId = course._id;

			const user = await db.collection('students').findOne({ baseUser: actualUser._id });
			const userId = user.baseUser;

			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + courseId + '/unsubscribe')
				.send({ user_id: userId });
			// check the post request is successful
			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0606');

			// check the number of subscribers is correct
			const courseNew = await db.collection('courses').findOne({ _id: courseId });
			const userNew = await db.collection('students').findOne({ baseUser: actualUser._id });
			expect(courseNew.numOfSubscriptions).toBe(0);
			expect(userNew.subscriptions).toHaveLength(0);
		});


		it('Should handle user not found error when unsubscribing', async () => {


			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			// create non existing user id
			const ObjectId = mongoose.Types.ObjectId;
			const userId = new ObjectId('5f841c2b1c8cfb2c58b78d66');

			// Simulate a request to unsubscribe with an non existing user id
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + courseId + '/unsubscribe')
				.send({ user_id: userId });


			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0004');
		});

		it('Should handle invalid user id when unsubscribing', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			// Simulate a request to unsubscribe with an invalid user id
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + courseId + '/unsubscribe')
				.send({ user_id: 'this-is-an-invalid-userId' });

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0014');
		});

		it('Should handle course not found error when unsubscribing', async () => {

			const user = await db.collection('students').findOne({ baseUser: actualUser._id });
			const userId = user.baseUser;

			// create non existing courseId
			const ObjectId = mongoose.Types.ObjectId;
			const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

			// Simulate a request to unsubscribe with an invalid user id
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + courseId + '/unsubscribe')
				.send({ user_id: userId });

			expect(response.status).toBe(404);
			expect(response.body.error.code).toBe('E0006');
		});

		it('Should handle invalid course id when unsubscribing', async () => {

			const user = await db.collection('students').findOne({ baseUser: actualUser._id });
			const userId = user._id;

			// Simulate a request to unsubscribe with an invalid user id
			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/this-is-aninvalid-courseId/unsubscribe')
				.send({ user_id: userId });

			expect(response.status).toBe(400);
			expect(response.body.error.code).toBe('E0014');
		});

		it('Should decrement the number of subscribers for a course, when unsubscribing', async () => {
			// find a course and set number of subscription to 3
			const courseUpdated = await db.collection('courses').findOneAndUpdate(
				{ title: 'test course' },
				{ $set: { numOfSubscriptions: 3 } },
				{ returnDocument: 'after' } // 'after' returns the updated document
			);
			const updatedCourse = courseUpdated.value;

			// find a user and add the course to the user's subscriptions
			const userUpdated = await db.collection('students').findOneAndUpdate(
				{ baseUser: actualUser._id },
				{ $push: { subscriptions: updatedCourse._id } },
				{ returnDocument: 'after' } // 'after' returns the updated document
			);
			const updatedUser = userUpdated.value;

			const response = await request(`http://localhost:${PORT}`)
				.post('/api/courses/' + updatedCourse._id + '/unsubscribe')
				.send({ user_id: updatedUser.baseUser });
			// check the post request is successful
			expect(response.status).toBe(200);

			// check the number of subscribers is decremented
			const courseNew = await db.collection('courses').findOne({ _id: updatedCourse._id });
			const userNew = await db.collection('students').findOne({ baseUser: actualUser._id });
			expect(courseNew.numOfSubscriptions).toBe(2);
			expect(userNew.subscriptions).toHaveLength(0);
		});

	});

	describe('GET /courses/creator/:userId', () => {

		it('Returns courses made by a given user', async () => {

			// clear the database for these tests
			await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection

			// Insert the fake user into the database
			await db.collection('courses').insertMany(fakeCourses);

			const courses = getFakeCoursesByCreator(fakeUser._id);
			// Send a get request to the courses endpoint
			const res = await request(`http://localhost:${PORT}`)
				.get(`/api/courses/creator/${fakeUser._id}`)
				.set('token', signAccessToken({ id: fakeUser._id }));

			expect(res.statusCode).toEqual(200);
			// Verify response body
			const result = res.body;

			let i = 0;
			// Verify that the response body contains the correct data
			if (result.length > 0) {
				res.body.forEach(course => {
					expect(course).toMatchObject({
						_id: expect.any(String),
						title: courses[i].title,
						description: courses[i].description,
						dateCreated: expect.any(String),
						dateUpdated: expect.any(String),
						category: courses[i].category,
						published: courses[i].published,
						sections: courses[i].sections,
						creator: courses[i].creator,
						difficulty: courses[i].difficulty,
						time: courses[i].time,
						rating: courses[i].rating,
					});
					i++;
				});
			} else {
				expect(result).toStrictEqual(courses);
			}
		});

		it('Returns error 401 if user is not authorized to access', async () => {

			// Send a get request to the courses endpoint
			const res = await request(`http://localhost:${PORT}`)
				.get(`/api/courses/creator/${fakeUser._id}`)
				.set('token', signAccessToken({ id: 'notAuthorized' }));
			expect(res.statusCode).toEqual(401);
			// Verify response body
			const result = res.body;

			expect(result.error).toStrictEqual(errorCodes['E0002']);
		});

	});

	describe('GET /courses', () => {
		it('Returns courses', async () => {
			// Send a get request to the courses endpoint

			// clear the database for these tests
			await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection

			// Insert the fake user into the database
			await db.collection('courses').insertMany(fakeCourses);

			const res = await request(`http://localhost:${PORT}`)
				.get('/api/courses')
				.set('token', signAccessToken({ id: ADMIN_ID }));
			expect(res.statusCode).toEqual(200);
			let i = 0;
			res.body.forEach(course => {
				expect(course).toMatchObject({
					_id: expect.any(String),
					title: fakeCourses[i].title,
					description: fakeCourses[i].description,
					dateCreated: expect.any(String),
					dateUpdated: expect.any(String),
					category: fakeCourses[i].category,
					published: fakeCourses[i].published,
					sections: fakeCourses[i].sections,
					creator: fakeCourses[i].creator,
					difficulty: fakeCourses[i].difficulty,
					estimatedHours: fakeCourses[i].estimatedHours,
					rating: fakeCourses[i].rating,
				});
				i++;
			});
		});

		it('Returns error 401 (E0002) if user is not authorized to access', async () => {

			let unauthorizedUser = makeFakeUser();
			unauthorizedUser.email = 'email@email.com'; // Avoiding duplicate error for email

			await db.collection('users').insertOne(unauthorizedUser);
			const unauthorizedUserInDB = await db.collection('users').findOne({ email: unauthorizedUser.email });

			// Send a get request to the courses endpoint
			const res = await request(`http://localhost:${PORT}`)
				.get(`/api/courses/creator/${fakeUser._id}`)
				.set('token', signAccessToken({ id: unauthorizedUserInDB._id }));
			expect(res.statusCode).toBe(401);
			// Verify response body
			const result = res.body;

			expect(result.error).toStrictEqual(errorCodes['E0002']);
		});

		it('Returns error 404 if no courses are found', async () => {

			// delete all courses
			await db.collection('courses').deleteMany({});

			// send request with no courses in db
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses')
				.set('token', signAccessToken({ id: ADMIN_ID }))
				.expect(200);

			// expect empty array
			expect(response.body).toHaveLength(0);
		});

		afterAll(async () => {
			await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
			await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
		});
	});

	describe('PUT /courses', () => {

		it('Creates a course', async () => {
			const token = signAccessToken({ id: fakeUser._id });
			const response = await request(app)
				.put('/api/courses/')
				.set('Authorization', `Bearer ${token}`)
				.send({ title: 'Test', category: 'sewing', difficulty: 1, description: 'Sewing test', estimatedHours: 2, creator: actualUser._id });

			expect(response.status).toBe(201);
			expect(response.body.title).toBe('Test');
			expect(response.body.category).toBe('sewing');
			expect(response.body.difficulty).toBe(1);
			expect(response.body.description).toBe('Sewing test');
			expect(response.body.estimatedHours).toBe(2);
		});
	});

	describe('GET courses/sections/:id/components', () => {
		it('Should get all components from a section', async () => {
			const section = await db.collection('sections').findOne({ _id: fakeSection._id });
			const componentLecture = await db.collection('lectures').findOne({ _id: fakeLection._id });
			const componentExercise = await db.collection('exercises').findOne({ _id: fakeExercise._id });

			section.components.push({
				compId: componentLecture._id,
				compType: COMP_TYPES.LECTURE,
			});

			section.components.push({
				compId: componentExercise._id,
				compType: COMP_TYPES.EXERCISE,
			});

			await db.collection('sections').findOneAndUpdate(
				{ _id: fakeSection._id },
				{ $set: section },
				{ returnDocument: 'after' }
			);
  
			const response = await request(`http://localhost:${PORT}`)
				.get('/api/courses/sections/' + fakeSection._id + '/components');
  
			expect(response.status).toBe(200);
			expect(await response.body).toBeInstanceOf(Array);
		});
	});


	describe('DELETE /courses/:courseId', () => {

		it('Delete the fake course', async () => {
			const token = signAccessToken({ id: fakeUser._id });
			const response = await request(app)
				.delete('/api/courses/' + fakeCourse._id)
				.set('Authorization', `Bearer ${token}`)
				.expect(200);

			expect(response.text).toBe('Course Deleted');
		});
	});


	describe('PATCH /courses/:courseId', () => {

		it('Update the fake course', async () => {
			const token = signAccessToken({ id: fakeUser._id });
			const response = await request(app)
				.patch('/api/courses/' + fakeCourse._id)
				.set('Authorization', `Bearer ${token}`)
				.send({ title: 'Test', category: 'sewing', difficulty: 1, description: 'Sewing test', estimatedHours: 2 })
				.expect(200);

			expect(response.body.title).toBe('Test');
			expect(response.body.category).toBe('sewing');
			expect(response.body.difficulty).toBe(1);
			expect(response.body.description).toBe('Sewing test');
			expect(response.body.estimatedHours).toBe(2);
		});
	});

	describe('PATCH /courses/:courseId/updateStatus', () => {
		it('Update status of the fake course to published', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;

			expect(course.status).toBe('draft');

			const response = await request(`http://localhost:${PORT}`)
				.patch('/api/courses/' + courseId + '/updateStatus')
				.set('token', signAccessToken({ id: fakeUser._id }))
				.send({ status : "published"})
				.expect(200);
			
			
			const updatedCourse = await db.collection('courses').findOne({ _id : courseId });
			expect(response.status).toBe(200);

			expect(updatedCourse.status).toBe('published');
		});
	});

	describe('PATCH /courses/:courseId/updateStatus', () => {
		it('Update status of the fake course to draft', async () => {

			//set up a published course in db
			await db.collection('courses').insertOne(fakeCoursePublished);
		
			const course = await db.collection('courses').findOne({ title: 'test course published' });
			const courseId = course._id;

			expect(course.status).toBe('published');

			const response = await request(`http://localhost:${PORT}`)
				.patch('/api/courses/' + courseId + '/updateStatus')
				.set('token', signAccessToken({ id: fakeUser._id }))
				.send({ status : "draft"})
				.expect(200);
			
			
			const updatedCourse = await db.collection('courses').findOne({ _id : courseId });
			expect(response.status).toBe(200);

			expect(updatedCourse.status).toBe('draft');
		});
	});
});