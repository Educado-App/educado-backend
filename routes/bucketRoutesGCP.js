const router = require("express").Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require('form-data');

const serviceUrl = "http://130.225.39.221:8080/bucket"

const dotenv = require("dotenv");

// Get list of all files in bucket
router.get("/", (req, res) => {
  //Forward to service api
  axios.get(serviceUrl).then((response) => {
    res.send(response.data);
  }).catch((error) => {
    res.send("Error: " + error);
  });
});

// Get file from bucket
router.get("/:filename", (req, res) => {
  //Forward to service api
  axios.get(serviceUrl + "/" + req.params.filename).then((response) => {
    res.send(response.data);
  }).catch((error) => {
    res.send("Error: " + error);
  });
});

// Delete file from bucket
router.delete("/:filename", (req, res) => {
  //Forward to service api
  axios.delete(serviceUrl + "/" + req.params.filename).then((response) => {
    res.send(response.data);
  }).catch((error) => {
    res.send("Error: " + error);
  });
});

// Upload file to bucket (take file and fileName). 
// Multer is used to store file in memory before upload

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), (req, res) => {
  const form = new FormData();
  form.append('file', req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype
  });
  form.append('fileName', req.body.fileName);

  axios.post(serviceUrl, form, { headers: form.getHeaders() })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.send("Error: " + error);
    });
});


module.exports = router;