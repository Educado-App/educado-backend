const router = require("express").Router();

// Models
const { LectureModel } = require("../models/Lectures");
const { ComponentModel } = require("../models/Components");
const {
  ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");
const { SectionModel } = require("../models/Sections");


/**
 * Create Lecture for section
 *  
 * @param {string} section_id - section id
 * @param {string} title - lecture title
 * @returns {object} course NOT SURE
 * 
 */
router.put("/create/:section_id", /*requireLogin,*/ async (req, res) => {
  console.log(req.body)
  const {title} = req.body; //Handles the data in "data" from the request
  const section_id = req.params.section_id; //Handles the data in "params" from the request
  
  console.log("lecture saved: " + section_id);

  const lecture = new LectureModel ({
    parentSection: section_id,
    title: title,
    description: "",
    dateCreated: Date.now(),
    dateUpdated: Date.now()
  });

  
  console.log("lecture: " + lecture);

  try {
    await lecture.save();
    section = await SectionModel.findById(section_id);
    await section.lectures.push(lecture._id);
    await section.save();
    res.send(section);
  } catch (err) {
    res.status(422).send(err);
  }
});


/**
 * Update the lecture
 * 
 * @param {string} id - lecture id
 * @returns {string} - Just sends a message to confirm that the update is complete
 */
router.patch("/:id", /*requireLogin,*/ async (req, res) => {
  const lecture = req.body;
  const { id } = req.params;

  // Find the lecture object by ID and update it
  const dbLecture = await LectureModel.findByIdAndUpdate(
    id,
    {
      title: lecture.title,
      description: lecture.description,
      dateUpdated: Date.now(),
    },
    function (err, docs) {
      if (err) {
        console.log("Error:", err);
        res.send(err);
      } else {
        console.log("Updated Lecture: ", docs);
      }
    }
  );
  res.send("Lecture Update Complete");
});


/**
 * Delete lecture from id
 * Remove it from the section lectures array
 * 
 * @param {string} id - lecture id
 * @returns {string} - Just sends a message to confirm that the deletion is complete
 */
router.delete("/delete/:id"/*, requireLogin*/, async (req, res) => {
  const { id } = req.params; // destructure params

  // Get the lecture object
  const lecture = await LectureModel.findById(id).catch((err) => {
    console.log(err);
  });

  // Get the section object
  const section_id = lecture.parentSection;
  const section = await SectionModel.findById(section_id).catch((err) => {
    console.log(err);
  });

  // Remove the lecture from the section lectures array
  let lectureIds = section.lectures;
  const index = lectureIds.indexOf(id);
  if (index > -1) {
    lectureIds.splice(index, 1);
  }
  (
    await SectionModel.findByIdAndUpdate(
      section_id,
      { lectures: lectureIds }
    )
  ).save();

  // Delete the lecture object
  await LectureModel.findByIdAndDelete(id).catch((err) => {
    console.log(err);
  });

  // Send response
  res.send("Lecture Deleted");
});


module.exports = router;