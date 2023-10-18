const request = require('supertest');
const express = require('express');
const router = require('../../routes/contentCreatorRoutes');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const makeFakeCreator = require('../fixtures/fakeContentCreator');

const app = express();
app.use(express.json());
app.use('/api/creators', router);

// Start the Express app on a specific port for testing
const PORT = 5020;
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});


describe('DELETE /api/creators/profiles/:id', () => {

  let fakeCreator, db;

  beforeAll(async () => {

    db = await connectDb(); // Connect to the database
    // Create a fake creator
    fakeCreator = makeFakeCreator();

  });

  beforeEach(async () => {
    // Insert the fake creator into the database
    await db.collection('contentcreators').insertOne(fakeCreator);
  });

  afterEach(async () => {
    // Remove the user from the database after each test
    await db.collection('contentcreators').deleteOne({ _id: fakeCreator._id });
  });


  it('should delete a content creator profile', async () => {

    const creator = await db.collection('contentcreators').findOne({
      email: 'test1@mail.dk'
    });
    const creatorId = creator._id

    // Perform the DELETE request
    const response = await request(`http://localhost:${PORT}`)
      .delete(`/api/creators/profiles/${creatorId}`);

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Content creator deleted successfully');

    // Verify that the creator is deleted from the database

    const deletedCreator = await db.collection('contentcreators').findOne({
      email: 'test1@mail.dk'
    });
    expect(deletedCreator).toBeNull();
  });

  it('should handle an invalid ID', async () => {
    // Perform a DELETE request with an invalid ID
    const response = await request(`http://localhost:${PORT}`)
      .delete('/api/creators/profiles/this-is-an-invalid-creatorId');

    // Assert the response
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('E0003');
  });

  it('should handle a non-existing creator', async () => {
    const ObjectId = mongoose.Types.ObjectId;
    const non_existing_id = new ObjectId();

    // Perform the DELETE request
    const response = await request(`http://localhost:${PORT}`)
      .delete('/api/creators/profiles/' + non_existing_id);

    // Assert the response
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await db.collection('contentcreators').deleteMany({}); // Delete all documents in the 'contentcreator' collection
    await server.close();
    await mongoose.connection.close();
  });

});