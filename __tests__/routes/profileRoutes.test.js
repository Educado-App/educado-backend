const request = require('supertest');
const express = require('express');
const router = require('../../routes/profileRoutes');
const connectDb = require('../fixtures/db');
const { encrypt } = require('../../helpers/password');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use('/api/profiles', router); // Mount the router under '/api' path


// Start the Express app on a specific port for testing
const PORT = 5023; // Choose a port for testing
const server = app.listen(PORT);

// Mocked token secret
const TOKEN_SECRET = 'test';

jest.mock('../../middlewares/requireLogin', () => {
  return (req, res, next) => {
    next();
  };
});

// Mock token secret
jest.mock('../../config/keys', () => {
  return {
    TOKEN_SECRET: TOKEN_SECRET,
  };
});


let db;

beforeAll(async () => {
  db = await connectDb();
});

afterEach(async () => {
  await db.collection('users').deleteMany({});
});

afterAll(async () => {
  await server.close();
  await mongoose.connection.close();
});

describe('Profile Routes', () => {

  describe('PUT /', () => {
    it('should update user profile', async () => {
      // Insert a user for testing
      const user = {
        _id: mongoose.Types.ObjectId(),
        email: 'test@example.com',
        password: encrypt('testpassword'),
      };
      await db.collection('users').insertOne(user);

      const updatedData = {
        userID: user._id.toString(),
        userBio: 'Updated bio',
        userLinkedInLink: 'https://www.linkedin.com/testuser',
        userName: 'UpdatedUserName',
        userEmail: 'updated.email@example.com',
        userPhoto: 'updated-photo-url',
      };

      const response = await request(`http://localhost:${PORT}`)
        .put('/api/profiles/')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeInstanceOf(Object);
      expect(response.body.user.userName).toBe(updatedData.userName);
      expect(response.body.user.userEmail).toBe(updatedData.userEmail);
    });

    it('should create a new profile if user does not exist', async () => {
      const newData = {
        userID: mongoose.Types.ObjectId().toString(),
        userBio: 'New bio',
        userLinkedInLink: 'https://www.linkedin.com/newuser',
        userName: 'NewUserName',
        userEmail: 'new.email@example.com',
        userPhoto: 'new-photo-url',
      };
      const response = await request(`http://localhost:${PORT}`)
        .put('/api/profiles/')
        .send(newData);
      expect(response.status).toBe(200);
      expect(response.body.user).toBeInstanceOf(Object);
      expect(response.body.user.userName).toBe(newData.userName);
      expect(response.body.user.userEmail).toBe(newData.userEmail);
    });
  });

  describe('Education', () => {
    it('should add education', async () => {
      // Insert a user for testing
      const education = {
        userID: mongoose.Types.ObjectId(),
        institution: 'test',
        startDate: 'test',
        endDate: 'test',
        course: 'test',
      };
      await db.collection('Education').insertOne(education);
      const response = await request(`http://localhost:${PORT}`)
        .put('/api/profiles/educations')
        .send(education);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.institution).toBe(education.institution);
      expect(response.body.course).toBe(education.course);
    });

    it('should Get education', async () => {
      const education = {
        userID: mongoose.Types.ObjectId(),
        institution: 'test',
        course: 'test',
      };
      await db.collection('Education').insertOne(education);
      const response = await request(`http://localhost:${PORT}`)
        .get(`/api/profiles/educations/${education.userID}`)
      expect(response.status).toBe(200);
    });
    it('should Delete education', async () => {
      const education = {
        _id: mongoose.Types.ObjectId(),
        institution: 'test',
        course: 'test',
      };
      await db.collection('Education').insertOne(education);
      const response = await request(`http://localhost:${PORT}`)
        .delete(`/api/profiles/educations/${education._id}`)
      expect(response.status).toBe(200);
    });
  });
  describe('Experience', () => {
    it('should add Experience', async () => {
      const experience = {
        userID: mongoose.Types.ObjectId(),
        company: 'test',
        jobTitle: 'test',
        description: 'test',
        startDate: 'test',
        endDate: 'test',
      };
      await db.collection('Experience').insertOne(experience);
      const response = await request(`http://localhost:${PORT}`)
        .put('/api/profiles/experiences')
        .send(experience);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.company).toBe(experience.company);
      expect(response.body.jobTitle).toBe(experience.jobTitle);
    });
    it('should Get Experience', async () => {
      const experience = {
        userID: mongoose.Types.ObjectId(),
        company: 'test',
        jobTitle: 'test',
      };
      await db.collection('Experience').insertOne(experience);
      const response = await request(`http://localhost:${PORT}`)
        .get(`/api/profiles/experiences/${experience.userID}`)
      expect(response.status).toBe(200);
    });
    it('should Delete Experience', async () => {
      const experience = {
        _id: mongoose.Types.ObjectId(),
        company: 'test',
        jobTitle: 'test',
      };
      await db.collection('Experience').insertOne(experience);
      const response = await request(`http://localhost:${PORT}`)
        .delete(`/api/profiles/experiences/${experience._id}`)
      expect(response.status).toBe(200);
    });
  });
});