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

/*** COURSE, SECTIONS AND EXERCISE ROUTES ***/


//Get all courses
router.get("/", async (req, res) => {
  try {
    // find all courses in the database
    const courses = await CourseModel.find();

    // check if sections exist
    if (courses.length === 0) {
      // Handle "courses not found" error response here
      return res.status(404).json({ error: errorCodes["E0005"] });
    }

    res.send(courses);
  } catch (error) {
    // If the server could not be reached, return an error message
    return res.status(500).json({ error: errorCodes["E0003"] });
  }
});


// Checks if user is subscribed to a specific course
router.get("/:courseId/users/:userId", async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    // checks if the course id exist in the users subscriptions field
    const user = await UserModel.findOne({ _id: userId, subscriptions: courseId });

    // return true if it exist and false if it does not
    if (user == null) {
      res.send("false");
    } else {
      res.send("true");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// get specific course
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // find a course based on it's id
    const course = await CourseModel.findById(id);

    // check if courses exist
    if (!course) {
      // Handle "course not found" error response here
      return res.status(404).json({ error: errorCodes["E0006"] });
    }
    res.send(course);
  } catch (error) {
    return res.status(500).json({ error: errorCodes["E0003"] });
  }
});

// Get all sections from course
router.get("/:id/sections", async (req, res) => {
  try {
    const { id } = req.params;

    // find a course based on it's id
    const course = await CourseModel.findById(id);

    // check if courses exist
    if (!course) {
      // Handle "course not found" error response here
      return res.status(404).json({ error: errorCodes["E0006"] });
    }

    const sectionsInCourse = course.sections;

    // check if course contains sections
    if (sectionsInCourse.length === 0) {
      // Handle "course does not contain sections" error response here
      return res.status(404).json({ error: errorCodes["E0009"] });
    }

    // check if the sections exists
    const sectionsList = await SectionModel.find({
      _id: { $in: sectionsInCourse },
    });
    if (sectionsList.length === 0) {
      // Handle "course does not contain sections" error response here
      return res.status(404).json({ error: errorCodes["E0007"] });
    }

    res.send(sectionsList);
  } catch (error) {
    return res.status(500).json({ error: errorCodes["E0003"] });
  }
});

// Get a specififc section
router.get("/:courseId/sections/:sectionId", async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    const course = await CourseModel.findById(courseId);
    // check if courses exist
    if (!course) {
      // Handle "course not found" error response here
      return res.status(404).json({ error: errorCodes["E0006"] });
    }
    // find a specific section within the given course by both IDs
    const section = await SectionModel.findOne({
      parentCourse: courseId,
      _id: sectionId,
    });

    // check if section exist
    if (!section) {
      // Handle "section not found" error response here
      return res.status(404).json({ error: errorCodes["E0008"] });
    }

    res.send(section);
  } catch (error) {
    return res.status(500).json({ error: errorCodes["E0003"] });
  }
});

/*** SUBSCRIPTION ROUTES ***/

// Subscribe to course
router.post("/:id/subscribe", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const user = await UserModel.findById(user_id);

    //checks if user exist
    if (!user) {
      // Handle "user not found" error response here
      return res.status(404).json({ error: errorCodes["E0004"] });
    }

    const course = await CourseModel.findById(id);
    // check if courses exist
    if (!course) {
      // Handle "course not found" error response here
      return res.status(404).json({ error: errorCodes["E0006"] });
    }

    // find user based on id, and add the course's id to the user's subscriptions field
    (
      await UserModel.findOneAndUpdate(
        { _id: user_id },
        { $push: { subscriptions: id } }
      )
    ).save;

    res.send(user);
  } catch (error) {
    return res.status(500).json({ error: errorCodes["E0003"] });
  }
});

// Unsubscribe to course
router.post("/:id/unsubscribe", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const user = await UserModel.findById(user_id);
    //checks if user exist
    if (!user) {
      // Handle "user not found" error response here
      return res.status(404).json({ error: errorCodes["E0004"] });
    }

    const course = await CourseModel.findById(id);
    // check if courses exist
    if (!course) {
      // Handle "course not found" error response here
      return res.status(404).json({ error: errorCodes["E0006"] });
    }

    // find user based on id, and remove the course's id from the user's subscriptions field
    (
      await UserModel.findOneAndUpdate(
        { _id: user_id },
        { $pull: { subscriptions: id } }
      )
    ).save;

    res.send(user);
  } catch (error) {
    return res.status(500).json({ error: errorCodes["E0003"] });
  }
});

// Get all exercises for section
router.get("/:section_id/exercises", async (req, res) => {
  const { section_id } = req.params;
  const section = await SectionModel.findById(section_id);
  const list = await ExerciseModel.find({ _id: section.exercises });
  res.send(list);
});

module.exports = router;
