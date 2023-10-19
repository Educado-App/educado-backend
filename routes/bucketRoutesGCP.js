const router = require("express").Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");

const dotenv = require("dotenv");

const path = require("path");

// Models
const { CourseModel } = require("../models/Courses");
const { ComponentModel } = require("../models/Components");

dotenv.config({ path: "./config/.env" });

const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Creates a client

// New GCP Bucket Instance
const storage = new Storage({
  projectId: credentials.project_id,
  keyFilename: credentials,
});

// Constant variables
const bucketName = "educado-bucket";
const dir = "./_temp_bucketFiles";

// New Multer Instance - for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});

// Get all content from bucket - filename, type, etc.
router.get("/list", async (req, res) => {
  console.log("GETTING LIST OF FILES FROM BUCKET");

  try {
    const [files] = await storage.bucket(bucketName).getFiles();

    const fileNames = files.map((file) => file.name);
    const fileTypes = files.map((file) => file.metadata.contentType);
    const fileSizes = files.map((file) => file.metadata.size);

    const fileData = {
      fileNames: fileNames,
      fileTypes: fileTypes,
      fileSizes: fileSizes,
    };

    res.status(200).send(fileData);
  } catch (err) {
    console.log("An error occurred:", err);
    res.status(400).send(`Error: ${err.message}`);
  }
});

// Get image from GCP bucket
router.get("/download", async (req, res) => {
  console.log("GETTING IMAGE FROM BUCKET");

  if (!req.query.fileName) {
    res
      .status(400)
      .send(
        "No file name provided. Use this format: /download?fileName=fileName"
      );
    return;
  }

  try {
    const fileName = req.query.fileName;
    const options = { destination: `${dir}/${fileName}` };

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    // Clear directory synchronously
    const files = fs.readdirSync(dir);
    for (const file of files) {
      fs.unlinkSync(`${dir}/${file}`);
    }

    // Download file
    await storage.bucket(bucketName).file(fileName).download(options);

    // Read and send file
    const fileContents = fs.readFileSync(`${dir}/${fileName}`);
    const base64 = fileContents.toString("base64");
    res.status(200).send(base64);
  } catch (err) {
    console.log("ERROR GETTING BUCKETIMAGE", err);

    res.status(400).send(`Error: ${err.message}`);
  }
});

//VIDEO STREAMING TEAM SHOULD BE USED FOR STREAMING VIDEOS
router.get("/stream/:fileName", async (req, res) => {
  console.log("GETTING VIDEO FROM BUCKET");
  //download video from bucket

  const { fileName } = req.params;

  console.log("fileName:", fileName);

  if (!fileName) {
    res
      .status(400)
      .send("No file name provided. Use this format: /stream/fileName");
    return;
  }

  try {
    const options = { destination: `${dir}/${fileName}` };

    const file = await storage
      .bucket(bucketName)
      .file(fileName)
      .download(options);
    //if file is not found

    const videoPath = path.join(dir, fileName);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {  
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.log("Error getting bucketvideo. It probably doesn't exist.");

    res.status(404).send(`Error: ${err.message}`);
  }
});

// Upload file to GCP bucket
router.post("/upload", upload.single("file"), async (req, res) => {
  const multerFile = req.file;
  const fileName = req.body.fileName;

  if (!multerFile) {
    res.status(400).send("No file uploaded.");
    return;
  }

  const buffer = req.file.buffer;
  console.log("buffer:", buffer);
  console.log("fileName:", fileName);
  console.log("multerFile:", multerFile);

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

    // console.log(`${fileName} uploaded to ${bucketName}.`);
  }
  res.status(200).send(`${fileName} uploaded to bucket ${bucketName}`);
});

router.delete("/delete", async (req, res) => {
  try {
    const fileName = req.query.fileName;
    console.log("fileName:", fileName);
    console.log("bucketName:", bucketName);

    // Delete the file from the bucket
    await storage.bucket(bucketName).file(fileName).delete();

    console.log(`${fileName} deleted from ${bucketName}.`);
    res.status(200).send(`${fileName} deleted from bucket ${bucketName}`);
  } catch (err) {
    console.log(err);
    res.status(404).send(`Error: ${err.message}`);
  }
});

module.exports = router;
