const router = require("express").Router();

// Models
const { SectionModel } = require('../models/Sections');
const { LectureModel } = require('../models/Lecture');
const { CourseModel } = require("../models/Courses");
const { ComponentModel } = require("../models/Components");
const {  ContentCreatorApplication } = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");

// Get all sections
router.get('/', async (req, res) => {
  const list = await SectionModel.find();
  res.send(list);
});


//CREATED BY VIDEOSTREAMING TEAM
//get section by id
router.get("/:sectionId", async (req, res) => {
  if (!req.params.sectionId)
    return res.send(
      "Missing query parameters. use endpoint like this: /section/section_id"
    );

  const section_id = req.params.sectionId;

  let section = await SectionModel.findById(section_id).catch((err) => {
    throw err;
  });



  if (section === null)
    return res.send("No section found with id: " + section_id);


  const lectures = await LectureModel.find({
    parentSection: section_id,
  }).catch((err) => {
    throw err;
  });


  // Convert the Mongoose document to a plain JavaScript object
  let _tempSection = section.toObject();

  // Now you can modify it
  _tempSection.components = lectures;


  return res.send(_tempSection);
});


module.exports = router;
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
    totalPoints: 0,
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
        res.status(422).send(err);
      }
    }
  );
  res.status(200).send(dbSection);
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

  // Get the section object
  const section = await SectionModel.findById(id).catch((err) => {
    res.status(422).send(err);

  });

  // Get the course, from the section object
  const course_id = section.parentCourse;
  const course = await CourseModel.findById(course_id).catch((err) => {
    res.status(422).send(err);
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
    await LectureModel.findByIdAndDelete( lecture_id).catch((err) => res.status(422).send(err));
  });

  // Delete the section
  await SectionModel.deleteOne({ _id: id }).catch((err) => res.status(422).send(err));



  // Send response
  res.status(200).send("Section Deleted");
});

module.exports = router;
