const request = require('supertest');
const express = require('express');
const router = require('../bucketRoutesGCP');

const app = express();
app.use(express.json());
app.use('', router); // Mount the router under '/' path

// Start the Express app on a specific port for testing
const PORT = 5000; // Choose a port for testing
const server = app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

