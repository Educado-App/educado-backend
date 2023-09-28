const router = require("express").Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");



// Models
const { CourseModel } = require("../models/Courses");
const { ComponentModel } = require("../models/Components");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // no larger than 5mb
  },
});

// Get image from GCP bucket
router.get("/download", async (req, res) => {
  // Creates a client using Application Default Credentials

  // Creates a client
  const storage = new Storage();

  const { fileName, bucketName } = req.body;

  async function downloadFile() {
    const options = {
      destination: fileName,
    };

    console.log("fileName:", fileName);
    console.log("bucketName:", bucketName);

    // Downloads the file
    await storage.bucket(bucketName).file(fileName).download(options);

    console.log(`gs://${bucketName}/${fileName} downloaded to ${fileName}.`);
  }

  downloadFile().catch(console.error);
  // [END storage_download_file]
});

//upload image to GCP bucket
// Upload file to GCP bucket
router.post("/upload", upload.single('file'), async (req, res) => {
// router.post("/upload", async (req, res) => {
  const storage = new Storage();

//   const bucketName = req.bucketName;
//   //console.log("bucketName:", bucketName);
//   const fileName = req.fileName;

  console.log("req params:", req.params);
    console.log("req body:", req.body);

    res.send("uploading file");
    return;
  // The path to your file to upload
  const filePath = "";

  // The new ID for your GCS file
  const destFileName = fileName;

  console.log("fileName:", fileName);
    console.log("bucketName:", bucketName);

  async function uploadFile() {
    const options = {
      destination: destFileName,
      // Optional:
      // Set a generation-match precondition to avoid potential race conditions
      // and data corruptions. The request to upload is aborted if the object's
      // generation number does not match your precondition. For a destination
      // object that does not yet exist, set the ifGenerationMatch precondition to 0
      // If the destination object already exists in your bucket, set instead a
      // generation-match precondition using its generation number.
      // preconditionOpts: {ifGenerationMatch: generationMatchPrecondition},
    };

    await storage.bucket(bucketName).upload(filePath, options);
    console.log(`${filePath} uploaded to ${bucketName}`);
  }

  uploadFile().catch(console.error);
  // [END storage_upload_file]
  ///
});

module.exports = router;
