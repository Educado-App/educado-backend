const request = require('supertest');
const express = require('express');
const router = require('../../routes/userRoutes');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeSection = require('../fixtures/fakeSection');
const makeFakeExercise = require('../fixtures/fakeExercise');
const makeFakeStudent = require('../fixtures/fakeStudent');
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
let fakeSection = makeFakeSection();
let fakeExercise = makeFakeExercise();

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

describe('Users Routes', () => {
  let token, fakeUser, db, actualUser, fakeStudent, actualStudent;

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database
    await db.collection('courses').insertOne(fakeCourse);
  });

  beforeEach(async () => {
    // Insert the fake user into the database before each test
    fakeUser = makeFakeUser();

    await db.collection('users').insertOne(fakeUser);
    actualUser = await db.collection('users').findOne({ email: fakeUser.email })

    fakeStudent = makeFakeStudent(actualUser._id);
    await db.collection('students').insertOne(fakeStudent);

    actualStudent = await db.collection('students').findOne({ baseUser: actualUser._id })
    token = signAccessToken({ id: actualUser._id })
  });

  afterEach(async () => {
    // Remove the user from the database after each test
    await db.collection('users').deleteOne({ _id: actualUser._id });
  });

  describe('DELETE /users/:userId', () => {

    it('Deletes a user successfully', async () => {
      // Delete the user using the API
      await request(`http://localhost:${PORT}`)
        .delete(`/api/users/${actualUser._id}`)
        .set('token', token) // Include the token in the request headers
        .expect(200);

      // Verify that the user was deleted from the database
      const user = await db.collection('users').findOne({ _id: actualUser._id });
      expect(user).toBeNull();
    });

    /*it('handles user not found error for delete', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();

      await request(`http://localhost:${PORT}`)
        .delete(`/api/users/${nonExistentUserId}`)
        .set('token', token) // Include the token in the request headers
        .expect(204);
    });*/

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
  });

  describe('PATCH /users/:userId', () => {

    it('Should change user credentials', async () => {
      const user = await db.collection('users').findOne({ email: fakeUser.email });

      const res = await request(`http://localhost:${PORT}`)
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
      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + user._id)
        .set('token', token) // Include the token in the request headers
        .send({
          email: 'hej@hej.dk'
        })
        .expect(200); // Expecting a 200 OK response

      const updatedUser = await db.collection('users').findOne({ _id: user._id });
      expect(updatedUser.dateUpdated-0).not.toBe(user.dateUpdated-0);
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

  /** Not needed after refacoring
   * Function already exist
  describe('DELETE /api/users/:userId', () => {

    it('should delete a user profile', async () => {

      const creator = await db.collection('users').findOne({
        email: actualUser.email
      });

      const creatorId = creator._id

      // Perform the DELETE request
      const response = await request(`http://localhost:${PORT}`)
        .delete(`/api/users/${creatorId}`);

      // Assert the response
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      // Verify that the creator is deleted from the database

      const deletedCreator = await db.collection('content-creators').findOne({
        _id: creatorId
      });
      expect(deletedCreator).toBeNull();
    });

    it('should handle an invalid ID', async () => {
      // Perform a DELETE request with an invalid ID
      const response = await request(`http://localhost:${PORT}`)
        .delete('/api/users/this-is-an-invalid-creatorId');

      // Assert the response
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('E0014');
    });

    it('should handle a non-existing user', async () => {
      const ObjectId = mongoose.Types.ObjectId;
      const non_existing_id = 'f19a9420d1ce3a2f9a5f3a2f';

      // Perform the DELETE request
      const response = await request(`http://localhost:${PORT}`)
        .delete('/api/users/' + non_existing_id);

      // Assert the response
      expect(response.status).toBe(204);
    });
  });

  **/

  describe('PATCH /api/users/:userId/password', () => {
    it('Should change password', async () => {
      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + actualUser._id + '/password')
        .set('token', token) // Include the token in the request headers
        .send({ oldPassword: 'ABC123456!', newPassword: 'newPassword' })

      expect(res.status).toBe(200);
      const updatedUser = await db.collection('users').findOne({ _id: actualUser._id });
      expect(updatedUser.password).not.toBe(actualUser.password);
    });

    it('Should return error if old password is wrong', async () => {
      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + actualUser._id + '/password')
        .set('token', token) // Include the token in the request headers
        .send({ oldPassword: 'wrongPassword', newPassword: 'newPassword' })

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('E0806');
    });

    it('Should return error if new password is invalid', async () => {
      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + actualUser._id + '/password')
        .set('token', token) // Include the token in the request headers
        .send({ oldPassword: 'ABC123456!', newPassword: 'new' })

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('E0213');
    });

    it('Should return error if new password is missing', async () => {
      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + actualUser._id + '/password')
        .set('token', token) // Include the token in the request headers
        .send({ oldPassword: 'ABC123456!' })

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('E0805');
    });

    it('Should return error if id is invalid', async () => {
      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/invalidId/password')
        .set('token', token) // Include the token in the request headers
        .send({ oldPassword: 'ABC123456!', newPassword: 'newPassword' })

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('E0014');
    });

    it('Should return error if no user is found with the id', async () => {
      const res = await request(`http://localhost:${PORT}`)
        .patch('/api/users/' + new mongoose.Types.ObjectId() + '/password')
        .set('token', token) // Include the token in the request headers
        .send({ oldPassword: 'ABC123456!', newPassword: 'newPassword' })

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('E0004');
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
