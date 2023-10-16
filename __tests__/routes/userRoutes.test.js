const request = require('supertest');
const express = require('express');
const router = require('../../routes/userRoutes');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const { signAccessToken, verify } = require('../../helpers/token');
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

  let token, fakeUser, db, actualUser;

    beforeAll(async () => {
      db = await connectDb(); // Connect to the database

      fakeUser = makeFakeUser();
      await db.collection('courses').insertOne(fakeCourse);

    });

    beforeEach(async () => {
      // Insert the fake user into the database before each test
      await db.collection('users').insertOne(fakeUser);
      actualUser = await db.collection('users').findOne({ email: fakeUser.email })
      token = signAccessToken({ id: actualUser._id })
    });

    afterEach(async () => {
      // Remove the user from the database after each test
      await db.collection('users').deleteOne({ _id: actualUser._id });
    });

  describe('Update User Email Route', () => {

    it('deletes a user successfully', async () => {
      // Delete the user using the API
      await request(`http://localhost:${PORT}`)
        .delete(`/api/users/delete/${actualUser._id}`)
        .set('token', token) // Include the token in the request headers
        .expect(200);

      // Verify that the user was deleted from the database
      const user = await db.collection('users').findOne({ _id: actualUser._id });
      expect(user).toBeNull();
    });

    /*it('handles user not found error for delete', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      await request(`http://localhost:${PORT}`)
        .delete(`/api/users/delete/${nonExistentUserId}`)
        .set('token', token) // Include the token in the request headers
        .expect(204);
    });*/

    it('updates user email successfully', async () => {
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

    it('Test that emails must be unique when updating', async () => {
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

    it('updates user first name successfully', async () => {
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

    it('updates user last name successfully', async () => {
      const newLastName = 'newLastName';

      const res = await request(`http://localhost:${PORT}`)
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

    it('updates user fields successfully', async () => {
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

    it('handles validation errors for email', async () => {
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

    it('handles validation errors for first name', async () => {
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
  });

  /** SUBSCRIPTIONS **/

  describe('GET /users', () => {

    it('should check if a user is subscribed to a specific course and return true', async () => {
      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;
      
      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // Find the user and update their subscriptions
      const result = await db.collection('users').findOneAndUpdate(
        { _id: userId }, // Convert userId to ObjectId if needed
        { $push: { subscriptions: courseId } },
        { returnDocument: 'after' } // 'after' returns the updated document
      )

      const updatedUser = result.value;

      // Check if the subscription was successfully added
      expect(updatedUser.subscriptions.find((element) => element == courseId));

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/subscriptions?user_id=' + userId + '&course_id=' + courseId);

      expect(response.status).toBe(200);
      expect(response.text).toBe('true');
    });

    it('should return false if a user is not subscribed to a specific course', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/subscriptions?user_id=' + userId + '&course_id=' + courseId);

      expect(response.status).toBe(200);
      expect(response.text).toBe('false');

    });

    /*it('should handle user not found error', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // create non existing userId
      const ObjectId = mongoose.Types.ObjectId;
      const userId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // simulate a request for a non-existent user
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/subscriptions?user_id=' + userId + '&course_id=' + courseId);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0004');
    });*/


    it('should handle invalid user id', async () => {

      const course = await db.collection('courses').findOne({ title: 'test course' });
      const courseId = course._id;

      // simulate a request with invalid user id
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/subscriptions?user_id=this-is-an-invalid-userId&course_id=' + courseId);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });

    it('should handle course not found error', async () => {

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // create non existing courseId
      const ObjectId = mongoose.Types.ObjectId;
      const courseId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // simulate a request for a non-existent course
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/subscriptions?user_id=' + userId + '&course_id=' + courseId);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0006');
    });


    it('should handle invalid course id', async () => {

      const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
      const userId = user._id;

      // simulate a request with invalid course id
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/subscriptions?user_id=' + userId + '&course_id=this-is-an-invalid-courseId');


      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
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
      expect(updatedUser.subscriptions.find((element) => element == courseId));

      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/' + userId + '/subscriptions');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.find((element) => element == courseId));

    });

    it('should handle user not found error', async () => {

      // create non existing userId
      const ObjectId = mongoose.Types.ObjectId;
      const userId = new ObjectId('5f841c2b1c8cfb2c58b78d68');

      // simulate a request for a non-existent user
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/' + userId + '/subscriptions');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('E0004');
    });


    it('should handle invalid user id', async () => {

      // simulate a request with invalid user id
      const response = await request(`http://localhost:${PORT}`)
        .get('/api/users/this-is-an-invalid-userId/subscriptions');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('E0003');
    });
  });

  describe('User PATCH route', () => {

    it('should change user credentials', async () => {
      const user = await db.collection('users').findOne({ email: fakeUser.email });

      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + user._id)
        .set('token', token) // Include the token in the request headers
        .send({ 
          password: 'newPassword',
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
        modifiedAt: expect.any(Date),
        subscriptions: user.subscriptions,
      });
    });
    
    it('return error if password is not atleast 8 characters long', async () => {
      const user = await db.collection('users').findOne({ email: fakeUser.email });

      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + user._id)
        .set('token', token) // Include the token in the request headers
        .send({ password: 'newpass'})
        .expect(400); // Expecting a 400 response

        expect(res.body.error.code).toBe('E0213');
    });

    it('return error if password does not contain atleast one letter', async () => {
      const user = await db.collection('users').findOne({ email: fakeUser.email });

      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + user._id)
        .set('token', token) // Include the token in the request headers
        .send({ password: '12345678'})
        .expect(400); // Expecting a 400 response

        expect(res.body.error.code).toBe('E0214');
    });

    it('return error if there is an attempt to update an illegal field name', async () => {
      const user = await db.collection('users').findOne({ email: fakeUser.email });

      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + user._id)
        .set('token', token) // Include the token in the request headers
        .send({ createdAt: Date.now() })
        .expect(400); // Expecting a 400 response

        expect(res.body.error.code).toBe('E0801');
    });

    it('return succesful updated object with new modifiedAt value ', async () => {
      const user = await db.collection('users').findOne({ email: fakeUser.email });

      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + user._id)
        .set('token', token) // Include the token in the request headers
        .send({ email: 'hej@hej.dk'
        })
        .expect(200); // Expecting a 200 OK response

      const updatedUser = await db.collection('users').findOne({ _id: user._id });

      expect(updatedUser.modifiedAt).not.toBe(user.modifiedAt);
  });

  it('return error if email you try to PATCH is identical', async () => {
    const user = await db.collection('users').findOne({ email: fakeUser.email });

    const res = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + user._id)
      .set('token', token) // Include the token in the request headers
      .send({email: fakeUser.email})
      .expect(400); // Expecting a 400 response

    expect(res.body.error.code).toBe('E0201');
});

it('return error if firstName you try to PATCH is identical', async () => {
  const user = await db.collection('users').findOne({ email: fakeUser.email });

  const res = await request(`http://localhost:${PORT}`)
    .patch('/api/users/' + user._id)
    .set('token', token) // Include the token in the request headers
    .send({firstName: fakeUser.firstName})
    .expect(400); // Expecting a 400 response

  expect(res.body.error.code).toBe('E0802');
});


});
  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    await db.collection('courses').deleteMany({}); // Delete all documents in the 'courses' collection
    server.close();
    mongoose.connection.close();
  });
});