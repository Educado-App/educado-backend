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