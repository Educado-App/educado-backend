const router = require("express").Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");

const dotenv = require("dotenv");

// Models
const { CourseModel } = require("../models/Courses");
const { ComponentModel } = require("../models/Components");

dotenv.config({ path: "./config/.env" });

const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Creates a client
const storage = new Storage({
  projectId: credentials.project_id,
  keyFilename: credentials,
});

const bucketName = "educado-bucket";
const dir = "./_temp_bucketFiles";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});

// Get image from GCP bucket
router.get("/download", async (req, res) => {

  console.log("GETTING IMAGE FROM BUCKET");

  if (!req.query.fileName) {
    res.status(400).send("No file name provided. use this format: /download?fileName=fileName");
    return;
  }

  try {
    const fileName = req.query.fileName;
    console.log("fileName:", fileName);
    console.log("bucketName:", bucketName);
    const options = {
      destination: `${dir}/${fileName}`,
    };

    //if directory does not exist, create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    //clear directory
    fs.readdir(dir, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlinkSync(`${dir}/${file}`);
      }
    });

    // Download the file and convert it to bytes to send it to the frontend
    await storage
      .bucket(bucketName)
      .file(fileName)
      .download(options).catch(err => {
        console.log(err);
        res.status(400).send(`Error: ${err.message}`);
      });

    // Read the file
    const fileContents = fs.readFileSync(`${dir}/${fileName}`);
    console.log("fileContents:", fileContents);

    // Convert to Base64 and send to frontend

    //clear directory
    fs.readdir(dir, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlinkSync(`${dir}/${file}`);
      }
    });

    const base64 = fileContents.toString("base64");
    res.status(200).send(base64);

  } catch (err) {
    console.log(err);
    // Return a more specific error message
    res.status(400).send(`Error: ${err.message}`);
  }
});

// Upload file to GCP bucket
router.post("/upload", upload.single("file"), async (req, res) => {
  const multerFile = req.file;
  const fileName = req.body.fileName;
  const bucketName = "educado-bucket";
  const buffer = req.file.buffer;

  console.log("fileName:", fileName);
  console.log("multerFile:", multerFile);

  if (!multerFile) {
    res.status(400).send("No file uploaded.");
    return;
  }

  //upload to bucket
  uploadFile().catch(console.error);

  async function uploadFile() {
    // Uploads a local file to the bucket
    await storage
      .bucket(bucketName)
      .file(fileName)
      .save(buffer, {
        metadata: {
          contentType: multerFile.mimetype,
        },
      });

    console.log(`${fileName} uploaded to ${bucketName}.`);
  }
  res.send(`${fileName} uploaded to bucket ${bucketName}`);
});

module.exports = router;
