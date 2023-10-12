const request = require('supertest');
const express = require('express');
const router = require('../../routes/userRoutes');
const connectDb = require('../fixtures/db')
const makeFakeUser = require('../fixtures/fakeUser')
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

// Mock token secret
jest.mock('../../config/keys', () => {
  return {
    TOKEN_SECRET
  };
});


describe('Update User Email Route', () => {
  let token, fakeUser, db;

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    token = signAccessToken({ id: 1 });
    fakeUser = makeFakeUser();

  });

  beforeEach(async () => {
    // Insert the fake user into the database before each test
    await db.collection('users').insertOne(fakeUser);
  });

  afterEach(async () => {
    // Remove the user from the database after each test
    await db.collection('users').deleteOne({ _id: fakeUser._id });
  });

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

  afterAll(async () => {
    await db.collection('users').deleteMany({}); // Delete all documents in the 'users' collection
    server.close();
    await mongoose.connection.close();
  });
});