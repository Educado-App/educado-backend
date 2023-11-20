const express = require('express');
const request = require('supertest');
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const mongoose = require('mongoose');
const lectureRoutes = require('../../routes/lectureRoutes');
const { LectureModel } = require('../../models/Lecture');
const connectDb = require('../../__tests__/fixtures/db');



app.use('/', lectureRoutes);

describe('Lecture Routes', () => {
    let db;
    let newLecture;

    beforeAll(async () => {
        db = await connectDb();

        const lecture = new LectureModel({
            title: "Test Lecture",
            description: "Test Description",
            parentSection: "6529091fddfe5294668541e2",
            image: "q",
            video: "q",
            completed: false,
        });

        newLecture = await db.collection("lectures").insertOne(lecture);

    });


    afterAll(async () => {
        await db.collection("lectures").deleteOne({ _id: newLecture.insertedId });
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