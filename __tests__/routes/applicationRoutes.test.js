const request = require('supertest');
const express = require('express');
const router = require('../../routes/applicationRoutes');

const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');

const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeApplication = require('../fixtures/fakeApplication');
const makeFakeContentCreator = require('../fixtures/fakeContentCreator');
const makeFakeInstitution = require('../fixtures/fakeInstitution');

const errorCodes = require('../../helpers/errorCodes');

const app = express();
app.use(express.json());
app.use('/api/application', router); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5019; // Choose a port for testing
const server = app.listen(PORT, () => {
});

//mock user
const newUser = makeFakeUser();

// Mock the sendMail function
jest.mock('../../helpers/email.js', () => ({
  sendMail: jest.fn().mockResolvedValue(true),  // Mock implementation
}));


describe('Application Routes', () => {
  let db; // Store the database connection

  beforeAll(async () => {
    db = await connectDb(); // Connect to the database
  });

  beforeEach(async () => {
    await db.collection('users').insertOne(newUser);
    const user = await db.collection('users').findOne({ email: 'fake@gmail.com' });
    let approved = false, rejected = false;

    const newContentCreator = makeFakeContentCreator(user._id, approved, rejected);
    const newApplication = makeFakeApplication(user._id);

    await db.collection('applications').insertOne(newApplication);
    await db.collection('content-creators').insertOne(newContentCreator);

  });

  afterEach(async () => {
    await db.collection('users').deleteMany({});
    await db.collection('content-creators').deleteMany({});
    await db.collection('applications').deleteMany({});
    await db.collection('institutions').deleteMany({});
  });

  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
  });

  // Test GET request
  describe('GET /api/application/:id', () => {
    it('Should get user data by ID', async () => {
      const fakeId = newUser._id;
      const response = await request(app)
        .get(`/api/application/${fakeId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  // Test POST request
  describe('POST /api/application/newapplication', () => {
    it('Should create a new application', async () => {

      const newApplicationUser = makeFakeUser(email = "fake@fakefake.dk");
      const newApplicationUserId = newApplicationUser._id;

      await db.collection('users').insertOne(newApplicationUser);
      
      const fakeTestApplication = makeFakeApplication(newApplicationUserId);


      const response = await request(app)
        .post('/api/application/newapplication')
        .send(fakeTestApplication)
        .expect(201);

      expect(response.body).toHaveProperty('application');

      expect(response.body.application).toHaveProperty('baseUser');

      const applicationBaseUserString = response.body.application.baseUser.toString();
      const baseUserIdString = newApplicationUserId.toString();

      expect(applicationBaseUserString).toEqual(baseUserIdString);
    });
  });

  //Test Application Approval
  describe('PUT /api/application/:id?approve', () => {
    it('Should approve an application', async () => {
      const fakeId = newUser._id;  // Assuming newUser is already defined in your test setup

      await request(app)
        .put(`/api/application/${fakeId}approve`)  // Updated the route
        .expect(200);  // Expect a successful approval

      const updatedNewContentCreator = await db.collection('content-creators').findOne({ baseUser: fakeId });
      
      expect(updatedNewContentCreator.approved).toBe(true);
    });
  });

  describe('PUT /api/application/:id?approve', () => {
    it('Should fail because it cannot find a content creator', async () => {
      const fakeNonContentCreator = makeFakeUser(email = "iamnotacontentcreator@mailmail.dk");
      await db.collection('users').insertOne(fakeNonContentCreator);

      const fakeNonContentCreatorId = fakeNonContentCreator._id;

      const res = await request(app)
        .put(`/api/application/${fakeNonContentCreatorId}approve`)  // Updated the route
        .expect(404);  // Expect a successful approval

      expect(res.body.error).toEqual(errorCodes.E1003.message);
    });
  });

  describe('PUT /api/application/:id?approve', () => {
    it('Should fail because it cannot find an application for a content creator', async () => {
      const newUserNoApp = makeFakeUser(email = "ihavenotapplied@mailmail.dk");
      await db.collection('users').insertOne(newUserNoApp);
      
      const fakeContentCreatorWithoutApplication = makeFakeContentCreator(newUserNoApp._id, false, false);
      await db.collection('content-creators').insertOne(fakeContentCreatorWithoutApplication);


      const newUserNoAppId = newUserNoApp._id;

      const res = await request(app)
        .put(`/api/application/${newUserNoAppId}approve`)  // Updated the route
        .expect(404);  // Expect a successful approval

      expect(res.body.error).toEqual(errorCodes.E1005.message);
    });
  });

  //Test Application Rejection
  describe('PUT /api/application/:id?reject', () => {
    it('Should reject an application with a reason', async () => {
      const fakeId = newUser._id;  // Assuming newUser is already defined in your test setup
      const rejectionReason = 'Not meeting the criteria';

      await request(app)
        .put(`/api/application/${fakeId}reject`)
        .send({ rejectionReason: rejectionReason })
        .expect(200);  // Expect a successful rejection

      const updatedNewContentCreator = await db.collection('content-creators').findOne({ baseUser: fakeId });
      expect(updatedNewContentCreator.rejected).toBe(true);
    });
  });


  //Institution Tests
  describe('POST /api/application/newinstitution', () => {

    it('Should create a new institution', async () => {

      const newInstitution = makeFakeInstitution("companyName", "@mail.com", "@mail.sub.com");

      const response = await request(app)
        .post('/api/application/newinstitution')
        .send(newInstitution)
        .expect(201);

      expect(response.body).toHaveProperty('institution');
    });
  });
});
