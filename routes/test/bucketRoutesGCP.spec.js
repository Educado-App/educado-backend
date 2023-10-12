const express = require('express');
const request = require('supertest');
const { expect } = require('chai');

const app = express();
const gcpRoutes = require('../bucketRoutesGCP'); // Adjust the path here

app.use('/gcp', gcpRoutes);

describe('GCP Routes', () => {
  // Test GET /download
  it('should get image from GCP bucket', async () => {
    const response = await request(app)
      .get('/gcp/download')
      .query({ fileName: 'gorilla.jpeg' });

    expect(response.status).to.equal(200);
    // Add more assertions as needed
  });

  it('should return 400 if no file name provided for GET /download', async () => {
    const response = await request(app)
      .get('/gcp/download');

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ error: 'No file name provided' });
    // Add more assertions as needed
  });

  // Test POST /upload
  it('should upload a file to GCP bucket', async () => {
    const response = await request(app)
      .post('/gcp/upload')
      .field('fileName', 'gorilla')
      .attach('file', '../_temp_bucketFiles/gorilla.jpg'); // Adjust the file path

    expect(response.status).to.equal(200);
    // Add more assertions as needed
  });

  it('should return 400 if no file uploaded for POST /upload', async () => {
    const response = await request(app)
      .post('/gcp/upload')
      .field('fileName', 'gorilla');

    expect(response.status).to.equal(400);
    expect(Buffer.byteLength(response.body)).to.equal(0);
    expect(response.body).to.deep.equal({ error: 'No file uploaded' });
    // Add more assertions as needed
  });
});
