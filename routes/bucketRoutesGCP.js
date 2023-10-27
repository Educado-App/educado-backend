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
router.get("/", async (req, res) => {
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
    res.status(400).send(`Error: ${err.message}`);
  }
});

// Get image from GCP bucket
router.get("/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  if (!fileName) {
    res
      .status(400)
      .send("No file name provided. Use this format: /:fileName. For example: /image.jpg");
    return;
  }

  try {
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
    res.status(400).send(`Error: ${err.message}`);
  }
});

//VIDEO STREAMING TEAM SHOULD BE USED FOR STREAMING VIDEOS
router.get("/stream/:fileName", async (req, res) => {
  //download video from bucket

  const { fileName } = req.params;

  if (!fileName) {
    res
      .status(400)
      .send("No file name provided. Use this format: /stream/fileName");
    return;
  }

  try {
    //Create dir if it doesn't exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    
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
    res.status(404).send(`Error: ${err.message}`);
  }
});

//Function to sanitize file name to prevent path traversal attacks
function sanitizeFileName(fileName) {
  return fileName.replace(/\.\./g, '').replace(/[^a-zA-Z0-9_.-]/g, '_');
}

// Upload file to GCP bucket
router.post("/upload", upload.single("file"), async (req, res) => {
  const multerFile = req.file;
  const fileName = sanitizeFileName(req.body.fileName);


  if (!multerFile) {
    res.status(400).send("No file uploaded.");
    return;
  }

  // Validate MIME type
  const validImageMimeTypes = [
    "image/jpeg", "image/png", "video/mp4", 
  ];
  if (!validImageMimeTypes.includes(multerFile.mimetype)) {
    res.status(400).send("Invalid file type. Please upload an image.");
    return;
  }

  const buffer = req.file.buffer;

  //upload to bucket
  uploadFile().catch(console.error);

  async function uploadFile() {
    try {
      await storage
        .bucket(bucketName)
        .file(fileName)
        .save(buffer, {
          metadata: {
            contentType: multerFile.mimetype,
          },
        });
      res.status(200).send(`${fileName} uploaded to bucket ${bucketName}`);
    } 
    catch (err) {
      console.error(err);
      res.status(500).send(`Error: ${err.message}`);
    }
  }
});

router.delete("/:fileName", async (req, res) => {
  try {
    const fileName = req.params.fileName;

    // Delete the file from the bucket
    await storage.bucket(bucketName).file(fileName).delete();

    res.status(200).send(`${fileName} deleted from bucket ${bucketName}`);
  } catch (err) {

    res.status(404).send(`Error: ${err.message}`);
  }
});

module.exports = router;