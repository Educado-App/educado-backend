const request = require('supertest');
const express = require('express');
const router = require('../../routes/applicationRoutes');
const mongoose = require('mongoose');
const connectDb = require('../fixtures/db');
const makeFakeUser = require('../fixtures/fakeUser');
const makeFakeApplication = require('../fixtures/fakeApplication');

const makeFakeContentCreator = require('../fixtures/fakeContentCreator')
const makeFakeInstitution = require('../fixtures/fakeInstitution')

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
    
    const fakeApplication = makeFakeApplication(user._id);

    await db.collection('content-creators').insertOne(newContentCreator);
    await db.collection('applications').insertOne(fakeApplication);

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

      const newUser2 = makeFakeUser(email = "fake2@fakemail.com");
      const newUser2Id = newUser2._id;

      await db.collection('users').insertOne(newUser2);

      const newApplication = makeFakeApplication(newUser2Id);
      const response = await request(app)
        .post('/api/application/newapplication')
        .send(newApplication)
        .expect(201);

      expect(response.body).toHaveProperty('application');
    });
  });

  //Test Application Approval
  describe('PUT /api/application/:id?approve', () => {
    it('Should approve an application', async () => {
      const fakeId = newUser._id;  // Assuming newUser is already defined in your test setup

      const res = await request(app)
        .put(`/api/application/${fakeId}approve`)  // Updated the route
        .expect(200);  // Expect a successful approval

      const updatedNewContentCreator = await db.collection('content-creators').findOne({ baseUser: fakeId });
      console.log(updatedNewContentCreator);
      expect(updatedNewContentCreator.approved).toBe(true);
    });
  });

  //Test Application Rejection
  describe('PUT /api/application/:id?reject', () => {
    it('Should reject an application with a reason', async () => {
      const fakeId = newUser._id;  // Assuming newUser is already defined in your test setup
      const reason = 'Not meeting the criteria';

      const res = await request(app)
        .put(`/api/application/${fakeId}reject`)  // Updated the route
        .send({ rejectionReason: reason });  // Sending the reason in the request body

      expect(res.status).toBe(200);
       
      const updatedNewContentCreator = await db.collection('content-creators').findOne({ baseUser: fakeId });
      expect(updatedNewContentCreator.rejected).toBe(true);
    });
  });


  //Institution Tests
  describe('POST /api/application/newinstitution', () => {

    it('Should create a new institution', async () => {

      const newInstitution = makeFakeInstitution("companyName", "@mail.com", "@sub.mail.com");

      const response = await request(app)
        .post('/api/application/newinstitution')
        .send(newInstitution);
        // .expect(201);

      expect(response.body).toHaveProperty('institution');
    });
  });
});
