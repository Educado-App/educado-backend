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
//get section by id
router.get("/section/:sectionId", async (req, res) => {
  if (!req.params.sectionId)
    return res.send(
      "Missing query parameters. use endpoint like this: /section/section_id"
    );

  const section_id = req.params.sectionId;

  let section = await SectionModel.findById(section_id).catch((err) => {
    console.log(err);
  });

  if (section === null)
    return res.send("No section found with id: " + section_id);

  //get lectures

  const lectures = await LectureModel.find({
    parentSection: section_id,
  }).catch((err) => {
    console.log(err);
  });

  let _tempSection = JSON.parse(JSON.stringify(section));
  _tempSection.components = lectures;

  return res.send(_tempSection);
});

// Section routes
router.post("/section/create", async (req, res) => {
  const { title, course_id, description } = req.body; // Or query?...

  console.log("body", req.body);
  console.log("creating section with this data:");

  const section = new SectionModel({
    title: title,
    exercises: [],
    parentCourse: course_id,
    description: description,
    totalPoints: 100,
    sectionNumber: 1,
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    components: [],
  });
  console.log("section", section);

  try {
    await section.save();
    course = await CourseModel.findById(course_id);
    await course.sections.push(section._id);
    await course.save();
    res.send({ course: course, section: section });
  } catch (err) {
    res.status(422).send(err);
  }
});

// Get all sections
router.post("/course/sections", requireLogin, async (req, res) => {
  const { sections } = req.body;
  let list = [];
  for (let i = 0; i < sections.length; i++) {
    const temp = await SectionModel.findOne({ _id: sections[i] });
    list.push(temp);
  }
  res.send(list);
});

// Update section title
router.post("/course/update/sectiontitle", async (req, res) => {
  // ...
  // get new value & section ID
  const { value, sectionId } = req.body;

  // find object in database and update title to new value
  (await SectionModel.findOneAndUpdate({ _id: sectionId }, { title: value }))
    .save;

  // Send response
  res.send("Completed");
});

// Update course description
router.post("/section/update/title", async (req, res) => {
  const { text, section_id } = req.body;

  // find object in database and update title to new value
  (await SectionModel.findOneAndUpdate({ _id: section_id }, { title: text }))
    .save;
  section = await SectionModel.findById(section_id);

  // Send response
  res.send(section);
});

// Update section description
router.post("/section/update/description", async (req, res) => {
  const { text, section_id } = req.body;

  // find object in database and update title to new value
  (
    await SectionModel.findOneAndUpdate(
      { _id: section_id },
      { description: text }
    )
  ).save;
  section = await SectionModel.findById(section_id);

  // Send response
  res.send(section);
});

// Update sections order
router.post("/course/update/sectionsorder", async (req, res) => {
  // Get sections from request
  const { sections, course_id } = req.body;
  // REPORT NOTE: Måske lav performance test, for om det giver bedst mening at wipe array og overskrive, eller tjekke 1 efter 1 om updates
  // Overwrite existing array
  (
    await CourseModel.findOneAndUpdate(
      { _id: course_id },
      { sections: sections }
    )
  ).save;

  course = await CourseModel.findById(course_id);

  // Send response
  res.send(course);
});

// Delete component for user
router.post("/section/delete", requireLogin, async (req, res) => {
  const { section_id, course_id } = req.body;

  const course = await CourseModel.findById(course_id).catch((err) => {
    console.log(err);
  });

  let sectionIds = course.sections;

  let index = sectionIds.indexOf(section_id);
  if (index !== -1) {
    sectionIds.splice(index, 1);
  }

  (
    await CourseModel.findOneAndUpdate(
      { _id: course_id },
      { sections: sectionIds }
    )
  ).save;

  await SectionModel.deleteOne({ _id: section_id }, (err) => {
    console.log(err);
  });

  res.send(sectionIds);
});

// Create Component
router.post("/component/create", async (req, res) => {
  const { type, section_id } = req.body; // Or query?...

  const component = new ComponentModel({
    type: type,
    file: "",
    text: "",
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
  });

  try {
    await component.save();
    section = await SectionModel.findById(section_id);
    await section.components.push(component._id);
    await section.save();
    res.send(section);
  } catch (err) {
    res.status(422).send(err);
  }
});

//Get all components
router.post("/component/all", async (req, res) => {
  const { components } = req.body;
  let list = [];
  for (let i = 0; i < components.length; i++) {
    const temp = await ComponentModel.findOne({ _id: components[i] });
    list.push(temp);
  }
  res.send(list);
});

//Update Component order
router.post("/component/updatecomponentorder", async (req, res) => {
  // Get components from request
  const { components, section_id } = req.body;
  (
    await SectionModel.findOneAndUpdate(
      { _id: section_id },
      { components: components }
    )
  ).save;
  section = await SectionModel.findById(section_id);
  // Send response
  res.send(section);
});

// Update section title
router.post("/component/text/update", async (req, res) => {
  const { text, component_id } = req.body;

  // find object in database and update title to new value
  (await ComponentModel.findOneAndUpdate({ _id: component_id }, { text: text }))
    .save;
  component = await ComponentModel.findById(component_id);

  // Send response
  res.send(component);
});

// Delete all documents for user
router.post("/component/delete", requireLogin, async (req, res) => {
  const { component_id, section_id } = req.body;

  const section = await SectionModel.findById(section_id).catch((err) => {
    console.log(err);
  });

  let componentIds = section.components;

  let index = componentIds.indexOf(component_id);
  if (index !== -1) {
    componentIds.splice(index, 1);
  }

  (
    await SectionModel.findOneAndUpdate(
      { _id: section_id },
      { components: componentIds }
    )
  ).save;

  await ComponentModel.deleteOne({ _id: component_id }, (err) => {
    console.log(err);
  });

  res.send(componentIds);
});

// Delete all documents for user
router.get("/course/delete_all", requireLogin, async (req, res) => {
  await CourseModel.deleteMany({ _user: req.user.id }, (err) => {
    console.log(err);
  });
  await SectionModel.deleteMany({}, (err) => {
    console.log(err);
  });
  await ComponentModel.deleteMany({}, (err) => {
    console.log(err);
  });
  res.send("Completed");
});

// User route
router.post("/user/", async (req, res) => {
  const { googleID } = req.body;

  const user = new UserModel({
    googleID: googleID,
    email: email,
    password: password,
    joinedAt: Date.now(),
    modifiedAt: Date.now(),
    subscriptions: [],
  });

  try {
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(422).send(err);
  }
});

/*** COURSE, SECTIONS AND EXERCISE ROUTES ***/

//Get all courses
router.get("/courses", async (req, res) => {
  try {
    // find all courses in the database
    const list = await CourseModel.find();
    res.send(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*** COURSE, SECTIONS AND EXERCISE ROUTES ***/

// Get all courses
/*router.get('/', adminOnly, async (req, res) => {
	const result = await CourseModel.find({});
	res.send(result);
});*/

// Get all courses for one user
router.get("/creator/:id", requireLogin, async (req, res) => {
  const id = req.params.id; // Get user id from request
  const courses = await CourseModel.find({ creator: id }); // Find courses for a specific user

  res.send(courses); // Send response
});

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
    console.log(error);
    return res.status(500).json({ error: errorCodes["E0003"] });
  }
});

// Get specific course
router.get("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // find a course based on it's id
    const course = await CourseModel.findById(id);
    res.send(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// delete section by id - USE WITH CAUTION SO YOU DONT MESS UP DATABASE RELATIONS
router.delete("/sections/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // find a section based on it's id and delete it
    const section = await SectionModel.findByIdAndDelete(id);
    res.send(section);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all sections from course
router.get("/courses/:id/sections", async (req, res) => {
  try {
    const { id } = req.params;

    // find all sections based on a course's id
    const sections = await SectionModel.find({ parentCourse: id });

    res.send(sections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specififc section
router.get("/courses/:courseId/sections/:sectionId", async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    // find a specific section within the given course by both IDs
    const section = await SectionModel.findOne({
      parentCourse: courseId,
      _id: sectionId,
    });
    res.send(section);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all excercies from a section
router.get(
  "/courses/:courseId/sections/:sectionId/exercises",
  async (req, res) => {
    try {
      const { courseId, sectionId } = req.params;

      // find a specific section within the given course by both IDs
      const exercises = await ExerciseModel.find({ parentSection: sectionId });
      res.send(exercises);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/*** SUBSCRIPTION ROUTES ***/

// Subscribe to course
router.post("/courses/:id/subscribe", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // find user based on id, and add the course's id to the user's subscriptions field
    (
      await UserModel.findOneAndUpdate(
        { _id: user_id },
        { $push: { subscriptions: id } }
      )
    ).save;

    let user = await UserModel.findById(user_id);
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unsubscribe to course
router.post("/courses/:id/unsubscribe", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // find user based on id, and remove the course's id from the user's subscriptions field
    (
      await UserModel.findOneAndUpdate(
        { _id: user_id },
        { $pull: { subscriptions: id } }
      )
    ).save;

    let user = await UserModel.findById(user_id);
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get users subscriptions
router.get("/users/:id/subscriptions", async (req, res) => {
  try {
    const userId = req.params.id;
    // Find the user by _id and select the 'subscriptions' field
    const user = await UserModel.findById(userId).select("subscriptions -_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscribedCourses = user.subscriptions;

    // Find courses based on the subscribed course IDs
    const list = await CourseModel.find({ _id: { $in: subscribedCourses } });

    res.send(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Checks if user is subscribed to a specific course
router.get("/users", async (req, res) => {
  try {
    const { course_id, user_id } = req.query;

    // checks if the course id exist in the users subscriptions field
    const user = await User.findOne({ _id: user_id, subscriptions: course_id });

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
