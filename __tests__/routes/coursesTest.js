const request = require('supertest');
const express = require('express');
const router = require('../../routes/courseRoutes'); // Import your router file here

const test_courseId =  

const app = express();
app.use(express.json());
app.use('/api', router); // Mount the router under '/api' path

describe('Courses Routes', () => {
  // Test the GET /courses/all route
  it('should get all courses', async () => {
    const response = await request(app).get('/courses/all');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    // Add more assertions as needed to check the response data
  });

  // Test the GET /courses/:id route
  it('should get a specific course', async () => {
    const courseId = 'replace-with-an-existing-course-id'; // Replace with an actual course ID
    const response = await request(app).get(`/courses/${courseId}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    // Add more assertions as needed to check the response data
  });

  // Add more test cases for other routes as needed
});
