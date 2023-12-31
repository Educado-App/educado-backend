const express = require('express');
const request = require('supertest');
const app = express();
const mongoose = require('mongoose');
const lectureRoutes = require('../../routes/lectureRoutes');
const { LectureModel } = require('../../models/Lectures');
const connectDb = require('../../__tests__/fixtures/db');



app.use('/', lectureRoutes);

describe('Lecture Routes', () => {
	let db;
	let newLecture;

	beforeAll(async () => {
		db = await connectDb();

		const lecture = new LectureModel({
			title: 'Test Lecture',
			description: 'Test Description',
			parentSection: '6529091fddfe5294668541e2',
			contentType: "text",
			content: "content",
			completed: false,
		});

		newLecture = await db.collection('lectures').insertOne(lecture);

	});


	afterAll(async () => {
		await db.collection('lectures').deleteOne({ _id: newLecture.insertedId });
		await mongoose.connection.close();
	});

	describe('GET /lectures/:lectureId', () => {

		// Test GET /:id
		it('Should return a lecture', async () => {
			const res = await request(app).get(`/${newLecture.insertedId}`);
			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveProperty('title', 'Test Lecture');
			expect(res.body).toHaveProperty('description', 'Test Description');
			expect(res.body).toHaveProperty('parentSection', '6529091fddfe5294668541e2');
		});

	});
});