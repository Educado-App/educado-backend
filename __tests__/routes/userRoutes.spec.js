const request = require('supertest');
const express = require('express');
const router = require('../../routes/userRoutes');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const { signAccessToken } = require('../../helpers/token');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use('/api/users', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5023; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

// Mocked token secret
const TOKEN_SECRET = 'test';

// make fake course
let fakeCourse = makeFakeCourse();

// Mock token secret
jest.mock('../../config/keys', () => {
  return {
    TOKEN_SECRET
  };
});

describe('Users Routes', () => {

  let token, fakeUser, db;

    beforeAll(async () => {
      db = await connectDb(); // Connect to the database

      token = signAccessToken({ id: 1 });
      fakeUser = makeFakeUser();
      await db.collection('courses').insertOne(fakeCourse);

    });

    beforeEach(async () => {
      // Insert the fake user into the database before each test
      await db.collection('users').insertOne(fakeUser);
    });

    afterEach(async () => {
      // Remove the user from the database after each test
      await db.collection('users').deleteOne({ _id: fakeUser._id });
    });

  describe('Update User Email Route', () => {

    it('deletes a user successfully', async () => {
      // Delete the user using the API
      await request(`http://localhost:${PORT}`)
        .delete(`/api/users/delete/${fakeUser._id}`)
        .set('token', token) // Include the token in the request headers
        .expect(200);

      // Verify that the user was deleted from the database
      const user = await db.collection('users').findOne({ _id: fakeUser._id });
      expect(user).toBeNull();
    });

    it('handles user not found error for delete', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      await request(`http://localhost:${PORT}`)
        .delete(`/api/users/delete/${nonExistentUserId}`)
        .set('token', token) // Include the token in the request headers
        .expect(204);
    });

    it('updates user email successfully', async () => {
      const newEmail = 'newemail@example.com';

      await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + fakeUser._id)
        .set('token', token) // Include the token in the request headers
        .send({ email: newEmail })
        .expect(200); // Expecting a 200 OK response

      // Verify that the user was saved in the database
      const user = await db.collection('users').findOne({ _id: fakeUser._id });
      expect(user).toBeDefined();
      expect(user.email).toBe(newEmail);
    });

    it('Test that emails must be unique when updating', async () => {
      const newEmail = fakeUser.email;

      const response = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + fakeUser._id)
        .set('token', token) // Include the token in the request headers
        .send({ email: newEmail })
        .expect(400); // Expecting a 400 Bad Request response

      expect(response.body.error.code).toBe('E0201');
    });

    it('handles user not found error for update-email', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const newEmail = 'newemail@example.com';

      await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + nonExistentUserId)
        .set('token', token) // Include the token in the request headers
        .send({ email: newEmail })
        .expect(204); // Expecting a 204 No Content response for user not found
    });

    it('updates user first name successfully', async () => {
      const newFirstName = 'newFirstName';

      await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + fakeUser._id)
        .set('token', token) // Include the token in the request headers
        .send({ firstName: newFirstName })
        .expect(200); // Expecting a 200 OK response

      // Verify that the user was saved in the database
      const user = await db.collection('users').findOne({ _id: fakeUser._id });
      expect(user).toBeDefined();
      expect(user.firstName).toBe(newFirstName);
    });

    it('handles user not found error for update-first-name', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      await request(`http://localhost:${PORT}`)
        .patch(`/api/users/${nonExistentUserId}`)
        .set('token', token) // Include the token in the request headers
        .send({ newFirstName: 'NewFirstName' })
        .expect(204);
    });

    it('updates user last name successfully', async () => {
      const newLastName = 'newLastName';

      await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + fakeUser._id)
        .set('token', token) // Include the token in the request headers
        .send({ lastName: newLastName })
        .expect(200); // Expecting a 200 OK response

      // Verify that the user was saved in the database
      const user = await db.collection('users').findOne({ _id: fakeUser._id });
      expect(user).toBeDefined();
      expect(user.lastName).toBe(newLastName);
    });

    it('handles user not found error for update-last-name', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      await request(`http://localhost:${PORT}`)
        .patch(`/api/users/${nonExistentUserId}`)
        .set('token', token) // Include the token in the request headers
        .send({ newLastName: 'NewLastName' })
        .expect(204);
    });

    it('updates user fields successfully', async () => {
      const newEmail = 'newemail@example.com';
      const newFirstName = 'Jane';

      await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + fakeUser._id)
        .set('token', token) // Include the token in the request headers
        .send({
          email: newEmail,
          firstName: newFirstName
        })
        .expect(200); // Expecting a 200 OK response

      // Verify that the user was updated in the database
      const updatedUser = await db.collection('users').findOne({ _id: fakeUser._id });
      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.firstName).toBe(newFirstName);
    });

    it('handles user not found error', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const newEmail = 'newemail@example.com';

      await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + nonExistentUserId)
        .set('token', token) // Include the token in the request headers
        .send({
          email: newEmail
        })
        .expect(204); // Expecting a 204 No Content response for user not found
    });

    it('handles validation errors for email', async () => {
      const invalidEmail = 'invalidemail'; // Invalid email format

      const response = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + fakeUser._id)
        .set('token', token) // Include the token in the request headers
        .send({
          email: invalidEmail
        })
        .expect(400); // Expecting a 400 Bad Request response

      expect(response.body.error.code).toBe('E0206');
    });

    it('handles validation errors for first name', async () => {
      const invalidFirstName = 'AASD!==#¤("DSN:_;>:'; // Invalid email format

      const response = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + fakeUser._id)
        .set('token', token) // Include the token in the request headers
        .send({
          firstName: invalidFirstName
        })
        .expect(400); // Expecting a 400 Bad Request response

      expect(response.body.error.code).toBe('E0211');
    });
  });

  /** SUBSCRIPTIONS **/

  describe('GET /users', () => {

    it('should check if a user is subscribed to a specific course and return true', async () => {
      const courseId = '651d3a15cda7d5bd2878dfc7';
      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // Find the user and update their subscriptions
      const result = await db.collection('users').findOneAndUpdate(
        { _id: userId }, // Convert userId to ObjectId if needed
        { $push: { subscriptions: courseId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );

      const updatedUser = result.value;

      // Check if the subscription was successfully added
      expect(updatedUser.subscriptions.includes(courseId)).toBe(true);

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users?user_id=' + userId + '&course_id=' + courseId);

      expect(response.status).toBe(200);
      expect(response.text).toBe('true');
    });



    it('should return false if a user is not subscribed to a specific course', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users?user_id=' + userId + '&course_id=' + courseId);

      expect(response.status).toBe(200);
      expect(response.text).toBe('false');

    });
  });

  describe('GET /users/:id/subscriptions', () => {
    it('should get user subscriptions', async () => {

      const courseId = '651d3a15cda7d5bd2878dfc7';
      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // Find the user and update their subscriptions
      const result = await db.collection('users').findOneAndUpdate(
        { _id: userId }, // Convert userId to ObjectId if needed
        { $push: { subscriptions: courseId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      );

      const updatedUser = result.value;

      // Check if the subscription was successfully added
      expect(updatedUser.subscriptions.includes(courseId)).toBe(true);

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/' + userId + '/subscriptions');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.find((element) => element == courseId));

    });
  });

  afterAll(async () => {
    db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
    server.close();
    await mongoose.connection.close();
  });

});