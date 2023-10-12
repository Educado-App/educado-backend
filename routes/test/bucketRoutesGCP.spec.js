const express = require('express');
const request = require('supertest');
const { expect } = require('chai');
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const gcpRoutes = require('../bucketRoutesGCP'); // Adjust the path here
const { set } = require('mongoose');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const bucketName = "educado-bucket";
const dir = "./_temp_bucketFiles";

app.use('/', gcpRoutes);

describe('GCP Routes', () => {

  beforeAll(async () => {
    const bucketName = "educado-bucket"; 
    const fileName = 'test1.png';
  
    // Use the Storage object to check if the file exists in the bucket
    const fileExists = await storage.bucket(bucketName).file(fileName).exists();
  
    if (!fileExists[0]) {
      // If the file doesn't exist, upload it to the bucket
      const filePath = path.join(__dirname, fileName);
      await storage.bucket(bucketName).upload(filePath, {
        destination: fileName,
      });
    }
  });

  afterAll(async () => {


  });

  // Test GET/Download 
  describe ('GET /download', () => {
    it('should get image from GCP bucket', async () => {
      
      const response = await request(app)
        .get('/download')
        .query({ fileName: 'test1.png' });

      expect(response.status).to.equal(200);
    });

    it('should return 400 if no file name provided for GET /download', async () => {
      const response = await request(app)
        .get('/download?fileName=CarlErBøsse');

      expect(response.status).to.equal(400);
    });
  });

  // Test Delete/Delete
  describe ('DELETE /delete', () => {
    it('should delete file from GCP bucket', async () => {
      const response = await request(app)
        .delete('/delete')
        .query({ fileName: "test1.png" }); // Use query parameters

      expect(response.status).to.equal(200);
    });
  });

  // Test POST/Upload
  describe('POST /upload', () => {
    it('should upload a file to GCP bucket', async () => {
      const filePath = path.join(__dirname, 'test1.png');
      const response = await request(app)
        .post('/upload')
        .field('fileName', 'test1.png')
        .attach('file', filePath);
  
      expect(response.status).to.equal(200);
    });
  });
  
  describe('POST /upload400', () => {
    it('should return 400 if no file is uploaded', async () => {
      const response = await request(app)
        .post('/upload')
        .field('fileName', 'test1.png');
  
      expect(response.status).to.equal(400);
      expect(response.text).to.equal('No file uploaded.');
    });

  });

});

