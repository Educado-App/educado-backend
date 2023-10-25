const router = require("express").Router();

// Models
const { LectureModel } = require("../models/Lectures");
const { CourseModel } = require("../models/Courses");
const { SectionModel } = require("../models/Sections");
const { ComponentModel } = require("../models/Components");
const {  ContentCreatorApplication } = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");

// Get all sections
router.get('/', async (req, res) => {
  const list = await SectionModel.find();
  res.send(list);
});

/**
 * Create section for course
 *  
 * @param {string} course_id - course id
 * @param {string} title - section title
 * @returns {object} course
 * 
 */
router.put("/:course_id", /*requireLogin,*/ async (req, res) => {
  const {title} = req.body; //Handles the data in "data" from the request
  const course_id = req.params.course_id; //Handles the data in "params" from the request
  
  const section = new SectionModel({
    parentCourse: course_id,
    title: title,
    description: "",
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    lectures: [],
    exercises: [],
  });

  try {
    await section.save();
    course = await CourseModel.findById(course_id);
    await course.sections.push(section._id);
    await course.save();
	  res.status(201).send(section);
  } catch (err) {
    res.status(422).send(err);
  }
});


/**
 * Get section by id
 * 
 * @param {string} id - section id
 * @returns {object} section
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params; // destructure params
  const section = await SectionModel.findById(id);
  res.send(section);
});

/**
 * Update section by id with the update button
 * 
 * @param {string} id - section id
 * @param {object} section - section object
 * @returns {string} - Just sends a message to confirm that the update is complete
 */
router.patch("/:id", /*requireLogin,*/ async (req, res) => {
  const section = req.body;
  const { id } = req.params;

  const dbSection = await SectionModel.findByIdAndUpdate(
    id,
    {
      title: section.title,
      description: section.description,
      dateUpdated: Date.now()
    },
    function (err, docs) {
      if (err) {
        console.log("Error:", err);
        res.send(err);
      } else {
        console.log("Updated section: ", docs);
      }
    }
  );
  res.send(dbSection);
});


/**
 * Delete section by id
 * Remove it from the course section array
 * Delete all lectures and excercises in the section
 * 
 * @param {string} id - section id
 * @returns {string} - Just sends a message to confirm that the deletion is complete
 */
router.delete("/:id"/*, requireLogin*/, async (req, res) => {
  const { id } = req.params;

  console.log("Deleting section: ", id);

  // Get the section object
  const section = await SectionModel.findById(id).catch((err) => {
    console.log(err);
  });

  // Get the course, from the section object
  const course_id = section.parentCourse;
  const course = await CourseModel.findById(course_id).catch((err) => {
    console.log(err);
  });

  // Remove the section from the course section array
  let sectionIds = course.sections;
  const index = sectionIds.indexOf(id);
  if (index > -1) {
    sectionIds.splice(index, 1);
  }
  (
    await CourseModel.findByIdAndUpdate(
      course_id,
      { sections: sectionIds }
    )
  ).save;

  // Get lecture array from section
  const lectureIds = section.lectures;

  // Delete all lectures and excercises in the section
  lectureIds.map(async (lecture_id) => {
    // Delete the lecture
    await LectureModel.findByIdAndDelete( lecture_id, (err) => {
      console.log(err);
    });
  });

  // Delete the section
  await SectionModel.deleteOne({ _id: id }, (err) => {
    console.log(err);
  });


  // Send response
  res.send("Section Deleted");
});

module.exports = router;
