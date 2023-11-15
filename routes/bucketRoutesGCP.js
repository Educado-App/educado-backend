const router = require("express").Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require('form-data');

//Get serviceUrl from environment variable
const serviceUrl = process.env.TRANSCODER_SERVICE_URL;
//const serviceUrl = "http://localhost:8080/api/v1";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get list of all files in bucket
router.get("/", (req, res) => {
  //Forward to service api
  axios.get(serviceUrl + "/bucket/").then((response) => {
    res.send(response.data);
  }).catch((error) => {
    if (error.response && error.response.data) {
      // Forward the status code from the Axios error if available
      res.status(error.response.status || 500).send(error.response.data);
    } else {
      // Handle cases where the error does not have a response part (like network errors)
      res.status(500).send({ message: "An error occurred during fecthing." });
    }
  });
});

// Get file from bucket
router.get("/:filename", (req, res) => {
  //Forward to service api
  axios.get(serviceUrl + "/bucket/" + req.params.filename).then((response) => {
    res.send(response.data);
  }).catch((error) => {
    if (error.response && error.response.data) {
      // Forward the status code from the Axios error if available
      res.status(error.response.status || 500).send(error.response.data);
    } else {
      // Handle cases where the error does not have a response part (like network errors)
      res.status(500).send({ message: "An error occurred during fetching." });
    }
  });
});

// Delete file from bucket
router.delete("/:filename", (req, res) => {
  //Forward to service api
  axios.delete(serviceUrl + "/bucket/" + req.params.filename).then((response) => {
    res.send(response.data);
  }).catch((error) => {
    if (error.response && error.response.data) {
      // Forward the status code from the Axios error if available
      res.status(error.response.status || 500).send(error.response.data);
    } else {
      // Handle cases where the error does not have a response part (like network errors)
      res.status(500).send({ message: "An error occurred during deletion." });
    }
  });
});

// Upload file to bucket
router.post("/", upload.single("file"), (req, res) => {
  const form = new FormData();

  // Add file and filename to form
  form.append('file', req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype
  });
  form.append('fileName', req.body.fileName);

  // Forward to service api
  axios.post(serviceUrl + '/bucket/', form, { headers: form.getHeaders() })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      if (error.response && error.response.data) {
        // Forward the status code from the Axios error if available
        res.status(error.response.status || 500).send(error.response.data);
      } else {
        // Handle cases where the error does not have a response part (like network errors)
        res.status(500).send({ message: "An error occurred during upload." });
      }
    });
});


// Stream file from bucket
router.get("/stream/:filename", (req, res) => {
  // Forward to Go service stream handler
  const streamUrl = serviceUrl + "/stream/" + req.params.filename;
  
  // Make a GET request to the Go service and pipe the response back to the client
  axios.get(streamUrl, { responseType: "stream" }).then((response) => {
    response.data.pipe(res);
  }).catch((error) => {
    if (error.response && error.response.data) {
      // Forward the status code from the Axios error if available
      res.status(error.response.status || 500).send(error.response.data);
    } else {
      // Handle cases where the error does not have a response part (like network errors)
      res.status(500).send({ message: "An error occurred during streaming." });
    }
  });
});


module.exports = router;