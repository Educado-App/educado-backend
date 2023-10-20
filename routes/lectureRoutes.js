const router = require("express").Router();

const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const fs = require("fs");
const path = require("path");

// Models
const { CourseModel } = require("../models/Courses");
const { SectionModel } = require("../models/Sections");
const { ComponentModel } = require("../models/Components");
const { UserModel } = require("../models/Users");
const { LectureModel } = require("../models/Lecture");
const { ExerciseModel } = require("../models/Exercises");

const { Storage } = require("@google-cloud/storage");
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Constant variables
const bucketName = "educado-bucket";
const dir = "./_vids";
const transcoder = require("../services/transcoderHub");

//const { LectureContentModel } = require("../models/LectureComponent");
const errorCodes = require("../helpers/errorCodes");
const adminOnly = require("../middlewares/adminOnly");

const {
  ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");
const { IdentityStore } = require("aws-sdk");
const multer = require("multer");

// New GCP Bucket Instance
const storage = new Storage({
  projectId: credentials.project_id,
  keyFilename: credentials,
});

//CREATED BY VIDEOSTREAMING TEAM
//create lecture
// Update Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // increased to 50mb to accommodate video
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

//CREATED BY VIDEOSTREAMING TEAM
//get lecture by id
router.get("/:lectureId", async (req, res) => {
  if (!req.params.lectureId) return res.send("Missing query parameters");

  const lectureId = req.params.lectureId;

  let lecture = await LectureModel.findById(lectureId).catch((err) => {
    console.log(err);
  });

  if (lecture === null)
    return res.send("No section found with id: " + lectureId);

  // //get LectureComponents
  // const components = await LectureContentModel.find({
  //   parentLecture: lectureId,
  // }).catch((err) => {
  //   console.log(err);
  // });

  // lecture.components = components;

  return res.send(lecture);
});

//CREATED BY VIDEOSTREAMING TEAM
//post pass to next lecture

router.post("/:lectureId/passlecture", async (req, res) => {
  const lectureId = req.params.lectureId;

  if (!lectureId) {
    return res.status(400).send("Missing lectureId in the request.");
  }

  try {
    // Find the current lecture based on lectureId
    const currentLecture = await LectureModel.findById(lectureId);

    if (!currentLecture) {
      return res.status(404).send("Lecture not found.");
    }

    // Mark the current lecture as completed
    currentLecture.completed = true;
    await currentLecture.save();

    // Find the section of the current lecture
    const section = await SectionModel.findById(currentLecture.parentSection);

    if (!section) {
      return res.status(404).send("Section not found.");
    }

    // Find the index of the current lecture in the section's components
    const currentIndex = section.components.indexOf(lectureId);

    // Check if there is a next lecture in the same section
    if (currentIndex < section.components.length - 1) {
      const nextLectureId = section.components[currentIndex + 1];
      const nextLecture = await LectureModel.findById(nextLectureId);

      if (!nextLecture) {
        return res.status(404).send("Next lecture not found.");
      }

      // Respond with the details of the next lecture
      return res.json(nextLecture);
    }

    // If there is no next lecture in the same section
    return res.status(404).send("No next lecture in the same section.");
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send("An error occurred while processing your request.");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // find a section based on it's id and delete it
    const lecture = await LectureModel.findByIdAndDelete(id);
    res.send(lecture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
