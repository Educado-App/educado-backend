const request = require('supertest');
const express = require('express');
const router = require('../../routes/feedbackRoutes');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const errorCodes = require('../../helpers/errorCodes');
const makeFakeFeedbackOptions = require('../fixtures/fakeFeedbackOptions');
const { CourseModel } = require('../../models/Courses');


const app = express();
app.use(express.json());
app.use('/api/feedback', router); // Mount the router under '/api' path

// Mock Google OAuth2 clientID
jest.mock('../../config/keys', () => {
	return {
		GOOGLE_CLIENT_ID: 'test',
		TOKEN_SECRET: 'test',
	};
});

// Start the Express app on a specific port for testing
const PORT = 5021; // Choose a port for testing
const server = app.listen(PORT, () => {
});

// Create a fake user, course and section
let fakeUser = makeFakeUser();
let fakeCourse = makeFakeCourse();
let fakeFeedBackOptions = makeFakeFeedbackOptions();


describe('Course Routes', () => {

	let db, actualUser;

	beforeAll(async () => {
		db = await connectDb();
	});

	beforeEach(async () => {
		await db.collection('users').insertOne(fakeUser);
		await db.collection('courses').insertOne(fakeCourse);
		await db.collection('feedbackOptions').insertMany(fakeFeedBackOptions);

		actualUser = await db.collection('users').findOne({ email: fakeUser.email });
	});

	afterEach(async () => {
		await db.collection('users').deleteMany({});
		await db.collection('courses').deleteMany({});
		await db.collection('feedbackOptions').deleteMany({}); 
		await db.collection('feedbacks').deleteMany({});
	});

	afterAll(async () => {
		await server.close();
		await mongoose.connection.close();
	});


	describe('POST /feedback/:courseId', () => {
		it('Send feedback about a course', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;
			
			const feedbackOpt = await db.collection('feedbackOptions').findOne({name: 'Easy to follow'});
			
			const rating = 5;
			const feedbackText = "Hello, world";
			const feedbackOptionsBody = [feedbackOpt]

			const body = {
				rating: rating,
				feedbackText: feedbackText,
				feedbackOptions: feedbackOptionsBody
			}

			const response = await request(`http://localhost:${PORT}`)
			.post('/api/feedback/' + courseId)
			.send(body)
			.expect(200);

			const updatedCourse = await db.collection('courses').findOne({ _id : courseId });

			const newFeedbackCount = {
				_id: feedbackOpt._id,
				count: 1,
			}

			const savedFeedback = await db.collection('feedbacks').findOne({courseId: courseId});			

			//course updated properly
			expect(updatedCourse.rating).toEqual(5);
			expect(updatedCourse.feedbackOptions).toContainEqual(newFeedbackCount);
			
			//compare values saved in feedbacks collection
			expect(savedFeedback.feedbackOptions).toEqual([feedbackOpt._id]);
			expect(savedFeedback.rating).toEqual(rating);
			expect(savedFeedback.feedbackText).toEqual(feedbackText);
		});
	});

	describe('POST /feedback/:courseId', () => {
		it('Send feedback about a course without feedback options', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;
					
			const rating = 5;
			const feedbackText = "Hello, world";
			const feedbackOptionsBody = []

			const body = {
				rating: rating,
				feedbackText: feedbackText,
				feedbackOptions: feedbackOptionsBody
			}

			const response = await request(`http://localhost:${PORT}`)
			.post('/api/feedback/' + courseId)
			.send(body)
			.expect(200);

			const updatedCourse = await db.collection('courses').findOne({ _id : courseId });

			const savedFeedback = await db.collection('feedbacks').findOne({courseId: courseId});			

			//course updated properly
			expect(updatedCourse.rating).toEqual(5);
			expect(updatedCourse.feedbackOptions).toEqual(course.feedbackOptions);
			
			//compare values saved in feedbacks collection
			expect(savedFeedback.feedbackOptions).toEqual([]);
			expect(savedFeedback.rating).toEqual(rating);
			expect(savedFeedback.feedbackText).toEqual(feedbackText);
		});
	});


	describe('POST /feedback/:courseId', () => {
		it('Send feedback about a course without feedback text', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;
			
			const feedbackOpt = await db.collection('feedbackOptions').findOne({name: 'Easy to follow'});
			
			const rating = 5;
			const feedbackText = "";
			const feedbackOptionsBody = [feedbackOpt]

			const body = {
				rating: rating,
				feedbackText: feedbackText,
				feedbackOptions: feedbackOptionsBody
			}

			const response = await request(`http://localhost:${PORT}`)
			.post('/api/feedback/' + courseId)
			.send(body)
			.expect(200);

			const updatedCourse = await db.collection('courses').findOne({ _id : courseId });

			const newFeedbackCount = {
				_id: feedbackOpt._id,
				count: 1,
			}

			const savedFeedback = await db.collection('feedbacks').findOne({courseId: courseId});			

			//course updated properly
			expect(updatedCourse.rating).toEqual(5);
			expect(updatedCourse.feedbackOptions).toContainEqual(newFeedbackCount);
			
			//compare values saved in feedbacks collection
			expect(savedFeedback.feedbackOptions).toEqual([feedbackOpt._id]);
			expect(savedFeedback.rating).toEqual(rating);
			expect(savedFeedback.feedbackText).toEqual(feedbackText);
		});
	});

	describe('POST /feedback/:courseId', () => {
		it('Send feedback about a course with only rating', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;
						
			const rating = 5;
			const feedbackText = "";
			const feedbackOptionsBody = []

			const body = {
				rating: rating,
				feedbackText: feedbackText,
				feedbackOptions: feedbackOptionsBody
			}

			const response = await request(`http://localhost:${PORT}`)
			.post('/api/feedback/' + courseId)
			.send(body)
			.expect(200);

			const updatedCourse = await db.collection('courses').findOne({ _id : courseId });

			const savedFeedback = await db.collection('feedbacks').findOne({courseId: courseId});			

			//course updated properly
			expect(updatedCourse.rating).toEqual(5);
			expect(updatedCourse.feedbackOptions).toEqual(course.feedbackOptions);
			
			//compare values saved in feedbacks collection
			expect(savedFeedback.feedbackOptions).toEqual([]);
			expect(savedFeedback.rating).toEqual(rating);
			expect(savedFeedback.feedbackText).toEqual("");
		});
	});

	describe('POST /feedback/:courseId', () => {
		it('Send feedback about a course without rating', async () => {

			const course = await db.collection('courses').findOne({ title: 'test course' });
			const courseId = course._id;
						
			const feedbackOpt = await db.collection('feedbackOptions').findOne({name: 'Easy to follow'});

			const rating = null;
			const feedbackText = "Hello, world";
			const feedbackOptionsBody = [feedbackOpt]

			const body = {
				rating: rating,
				feedbackText: feedbackText,
				feedbackOptions: feedbackOptionsBody
			}

			const response = await request(`http://localhost:${PORT}`)
			.post('/api/feedback/' + courseId)
			.send(body);

			expect
		});
	});

	// describe('GET the available feedback options from the database',() => {
	// 	it('Send the feedback options to the frontend', () => {
	// 		//something something here. :)
			

			
	// 	});
	// });
});