const router = require("express").Router();
const errorCodes = require("../helpers/errorCodes");
const adminOnly = require("../middlewares/adminOnly");
const mongoose = require("mongoose");

// Models
const { CourseModel } = require("../models/Courses");
const { SectionModel } = require("../models/Sections");
const { ComponentModel } = require("../models/Components");
const { UserModel } = require("../models/Users");
const {
  ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");
const { IdentityStore } = require("aws-sdk");

// Get all sections
router.get("/", async (req, res) => {
  const list = await SectionModel.find();
  res.send(list);
});

// Get specific section
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id)
  const section = await SectionModel.findById(id);
  console.log("Section: " + section)
  res.send(section);
});

module.exports = router;