const router = require("express").Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");

// Models
const { CourseModel } = require("../models/Courses");
const { ComponentModel } = require("../models/Components");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
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
router.post("/upload", upload.single("file"), async (req, res) => {
  const multerFile = req.file;
  const { fileName, bucketName } = req.body;
  const buffer = req.file.buffer;

  console.log("fileName:", fileName);
  console.log("bucketName:", bucketName);
  console.log("multerFile:", multerFile);

  if (!multerFile) {
    res.status(400).send("No file uploaded.");
    return;
  }

  const storage = new Storage();

  //upload to bucket

  uploadFile().catch(console.error);

  async function uploadFile() {
    // Uploads a local file to the bucket
    await storage
      .bucket("")
      .file(fileName)
      .save(buffer, {
        metadata: {
          contentType: multerFile.mimetype,
        },
      });

    console.log(`${fileName} uploaded to ${bucketName}.`);
  }
});

//create bucket in GCP
router.post("/bucket/create", async (req, res) => {
  // [START storage_create_bucket]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // Imports the Google Cloud client library

  // Creates a client
  // The bucket in the sample below will be created in the project asscociated with this client.
  // For more information, please see https://cloud.google.com/docs/authentication/production or https://googleapis.dev/nodejs/storage/latest/Storage.html
  const storage = new Storage();

  const bucketName = req.body.bucketName;

  if (!bucketName) {
    res.status(400).send("No bucket name provided.");
    return;
  }

  async function createBucket() {

    const [bucket] = await storage.createBucket(bucketName);

    console.log(`Bucket ${bucket.name} created.`);
  }

  createBucket().catch(console.error);
  // [END storage_create_bucket]
});

//list buckets
router.get("/bucket/list", async (req, res) => {
    console.log("GETTING ALL BUCKET LISTS")
    const storage = new Storage();


  async function listBuckets() {
    const [buckets] = await storage.getBuckets();
    console.log('Buckets:');
    buckets.forEach(bucket => {
      console.log(bucket.name);

    });
  }

  listBuckets().catch(console.error);
  
})

module.exports = router;
