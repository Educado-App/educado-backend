const request = require('supertest');
const express = require('express');
const router = require('../../routes/userRoutes');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeCourse = require('../fixtures/fakeCourse');
const makeFakeSection = require('../fixtures/fakeSection');
const makeFakeExercise = require('../fixtures/fakeExercise');
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

// Mock token secret
jest.mock('../../config/keys', () => {
	return {
		TOKEN_SECRET
	};
});


describe('Update User Route', () => {
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
      .expect(404); // Expecting a 404 No Content response for user not found
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

  it('handles validation errors for last name', async () => {
    const invalidLastName = 'AASD!==#¤("DSN:_;>:'; // Invalid email format

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id)
      .set('token', token) // Include the token in the request headers
      .send({
        lastName: invalidLastName
      })
      .expect(400); // Expecting a 400 Bad Request response

    expect(response.body.error.code).toBe('E0211');
  });

  afterAll(async () => {
    // Clean up: delete all created users in the 'users' collection
    await db.collection('users').deleteMany({});
	});
});

describe('Update points and level', () => {
  let token, fakeUser, db;

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    token = signAccessToken({ id: 1 });
    fakeUser = makeFakeUser();
	});

  afterAll(async () => {
    // Clean up: delete all created users in the 'users' collection
    await db.collection('users').deleteMany({});
  });

  beforeEach(async () => {
    // Insert the fake user into the database before each test
    await db.collection('users').insertOne(fakeUser);
  });

  afterEach(async () => {
    // Remove the user from the database after each test
    await db.collection('users').deleteOne({ _id: fakeUser._id });
  });

  it('Update points succesfully', async () => {
    const points = 10;
    
    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id)
      .set('token', token) // Include the token in the request headers
      .send({
        points: points
      })
      .expect(200); // Expecting a 400 Bad Request response

      // Verify that the user was updated in the database
      const updatedUser = await db.collection('users').findOne({ _id: fakeUser._id });
      expect(updatedUser.points).toBe(points);
      expect(updatedUser.level).toBe(1);
  });

  it('Update level succesfully', async () => {
    const points = 120;

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id)
      .set('token', token) // Include the token in the request headers
      .send({
        points: points
      })
      .expect(200); // Expecting a 400 Bad Request response

      // Verify that the user was updated in the database
      const updatedUser = await db.collection('users').findOne({ _id: fakeUser._id });
      expect(updatedUser.points).toBe(20);
      expect(updatedUser.level).toBe(2);
  });

  it('Handles validation errors for points', async () => {
    const invalidPoints = 'invalidPoints';

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id)
      .set('token', token) // Include the token in the request headers
      .send({
        points: invalidPoints
      })
      .expect(400); // Expecting a 400 Bad Request response

    expect(response.body.error.code).toBe('E0702');
  });

  it('Handles negative value for points', async () => {
    const invalidPoints = -50;

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id)
      .set('token', token) // Include the token in the request headers
      .send({
        points: invalidPoints
      })
      .expect(400); // Expecting a 400 Bad Request response

    expect(response.body.error.code).toBe('E0701');
  });

  it('Handles 0 value for points', async () => {
    const invalidPoints = 0;

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id)
      .set('token', token) // Include the token in the request headers
      .send({
        points: invalidPoints
      })
      .expect(400); // Expecting a 400 Bad Request response

    expect(response.body.error.code).toBe('E0701');
  });
});

describe('Handles answering exercises', () => {
  let token, fakeUser, fakeCourse, fakeSection, fakeExercise, db;

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database

    token = signAccessToken({ id: 1 });
    fakeUser = makeFakeUser();
	});

  afterAll(async () => {
    // Clean up: delete all created users in the 'users' collection
    await db.collection('users').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('sections').deleteMany({});
    await db.collection('exercises').deleteMany({});

    // Close the server and database connection after all tests
    server.close();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    fakeCourse = makeFakeCourse();
    fakeSection = makeFakeSection();
    fakeExercise = makeFakeExercise();

    await db.collection('users').insertOne(fakeUser);

    // Insert the fake course into the database
    await db.collection('courses').insertOne(fakeCourse);

    // Insert the fake section into the database
    await db.collection('sections').insertOne(fakeSection);

    // Insert the fake exercise into the database
    await db.collection('exercises').insertOne(fakeExercise);

    // Add the connection between the course, section, and exercise
    fakeCourse.sections.push(fakeSection._id);

    fakeSection.exercises.push(fakeExercise._id);
    fakeSection.parentCourse = fakeCourse._id;

    fakeExercise.parentSection = fakeSection._id;

    // Update course in the database
    await db.collection('courses').updateOne({ _id: fakeCourse._id }, { $set: fakeCourse });

    // Update section in the database
    await db.collection('sections').updateOne({ _id: fakeSection._id }, { $set: fakeSection });

    // Update exercise in the database
    await db.collection('exercises').updateOne({ _id: fakeExercise._id }, { $set: fakeExercise });
});


  afterEach(async () => {
    // Remove the user from the database after each test
    await db.collection('users').deleteOne({ _id: fakeUser._id });

    // Remove the course from the database after each test
    await db.collection('courses').deleteOne({ _id: fakeCourse._id });

    // Remove the section from the database after each test
    await db.collection('sections').deleteOne({ _id: fakeSection._id });

    // Remove the exercise from the database after each test
    await db.collection('exercises').deleteOne({ _id: fakeExercise._id });
  });

  it('Adds exerciseId to completed exercises correctly', async () => {
    const exerciseId = fakeExercise._id; // Replace this with an actual exercise ID from your database

    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id + '/completed')
      .set('token', token) // Include the token in the request headers
      .send({ exerciseId: exerciseId })
      .expect(200);
  
    // Fetch the user from the database to verify the changes
    const updatedUser = await db.collection('users').findOne({ _id: fakeUser._id });
        
    const completedExerciseIds = updatedUser.completedCourses[0].completedSections[0].completedExercises.map(exercise => exercise.exerciseId.toString());
    expect(completedExerciseIds).toEqual([exerciseId.toString()]);
  }); 
  
  it('Fails to add exerciseId to completed exercises without authentication', async () => {
    const exerciseId = fakeExercise._id;
  
    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id + '/completed')
      .send({ exerciseId: exerciseId })
      .expect(401);
  
    expect(response.body.error).toEqual('You must be logged in!');
  });
  
  it('Fails to add non-existing exerciseId to completed exercises', async () => {
    const nonExistingExerciseId = new mongoose.Types.ObjectId();
  
    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + fakeUser._id + '/completed')
      .set('token', token)
      .send({ exerciseId: nonExistingExerciseId })
      .expect(404);
  
      expect(response.body.error.code).toBe('E0012');
  });
  
  it('Fails to add exerciseId to completed exercises for non-existing user', async () => {
    const exerciseId = fakeExercise._id;
    const nonExistingUserId = new mongoose.Types.ObjectId();
  
    const response = await request(`http://localhost:${PORT}`)
      .patch('/api/users/' + nonExistingUserId + '/completed')
      .set('token', token)
      .send({ exerciseId: exerciseId })
      .expect(404);
  
      expect(response.body.error.code).toBe('E0004');
  });  
});