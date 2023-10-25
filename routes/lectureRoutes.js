const router = require("express").Router();
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const fs = require("fs");
const path = require("path");

// Models
const { SectionModel } = require("../models/Sections");
const { LectureModel } = require("../models/Lecture");

//CREATED BY VIDEOSTREAMING TEAM
//get lecture by id
router.get("/:id", async (req, res) => {
  if (!req.params.id) return res.send("Missing query parameters");

  const lectureId = req.params.id;

  let lecture = await LectureModel.findById(lectureId).catch((err) => {
    throw err;
  });

  if (lecture === null)
    return res.send("No section found with id: " + lectureId);
  return res.send(lecture);
});

//CREATED BY VIDEOSTREAMING TEAM
//post pass to next lecture

router.put("/:id/passlecture", async (req, res) => {
  const lectureId = req.params.id;

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
