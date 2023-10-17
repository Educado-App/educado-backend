const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  ContentCreator,
} = require("../models/ContentCreatorApplication");

router.delete("/profile/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting creator with ID:", id);

    const deletedCreator = await ContentCreator.findByIdAndDelete(id);

    if (!deletedCreator) {
      console.log("Content creator not found.");
      return res.status(204).json({ 'error': errorCodes['E0011'] });
    } else {
      console.log("Content creator deleted successfully.");
      return res.status(200).json({ message: "Content creator deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ 'error': errorCodes['E0003'] });
  }
});



module.exports = router;