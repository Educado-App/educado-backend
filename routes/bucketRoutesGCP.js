const router = require("express").Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require('form-data');

const serviceUrl = "http://130.225.39.221:8080";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get list of all files in bucket
router.get("/", (req, res) => {
  //Forward to service api
  axios.get(serviceUrl + "/bucket/").then((response) => {
    res.send(response.data);
  }).catch((error) => {
    res.send("Error: " + error);
  });
});

// Get file from bucket
router.get("/:filename", (req, res) => {
  //Forward to service api
  axios.get(serviceUrl + "/bucket/" + req.params.filename).then((response) => {
    res.send(response.data);
  }).catch((error) => {
    res.send("Error: " + error);
  });
});

// Delete file from bucket
router.delete("/:filename", (req, res) => {
  //Forward to service api
  axios.delete(serviceUrl + "/bucket/" + req.params.filename).then((response) => {
    res.send(response.data);
  }).catch((error) => {
    res.send("Error: " + error);
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
  axios.post(serviceUrl, form, { headers: form.getHeaders() })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.send("Error: " + error);
    });
});

// Stream file from bucket
router.get("/stream/:filename", (req, res) => {
  // Forward to Go service stream handler
  const streamUrl = serviceUrl + "/stream/" + req.params.filename;
  
  // Make a GET request to the Go service and pipe the response back to the client
  axios({
    method: 'get',
    url: streamUrl,
    responseType: 'stream'
  }).then(response => {
    res.set(response.headers);
    response.data.pipe(res);
  }).catch(error => {
    res.status(500).send("Error: " + error);
  });
});



module.exports = router;