const router = require("express").Router();
const errorCodes = require("../helpers/errorCodes");
const adminOnly = require("../middlewares/adminOnly");
const mongoose = require("mongoose");

// Models
const { CourseModel } = require("../models/Courses");
const { SectionModel } = require("../models/Sections");
const { ComponentModel } = require("../models/Components");
const { ExerciseModel } = require("../models/Exercises");
const { UserModel } = require("../models/Users");
const {
  ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");
const { IdentityStore } = require("aws-sdk");

// Get all exercises
router.get("/", async (req, res) => {
  const list = await ExerciseModel.find();
  res.send(list);
});

// Get specific exercise
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const exercise = await ExerciseModel.findById(id);
  res.send(exercise);
});

module.exports = router;