const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  ContentCreator,
} = require("../models/ContentCreatorApplication");

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting creator with ID:", id);

    // Check if the ID is valid
    if (!id) {
      console.log("Invalid ID provided.");
      return res.status(400).json({ error: 'Invalid ID provided' });
    }

    const allCreators = await ContentCreator.find({});
    console.log("All content creators:", allCreators);

    const creator = await ContentCreator.findById(id);
    console.log("Content creator:", creator);
    const deletedCreator = await ContentCreator.findByIdAndDelete(id);

    if (!deletedCreator) {
      console.log("Content creator not found.");
      return res.status(204).json({ error: 'Content creator not found' });
    } else {
      console.log("Content creator deleted successfully.");
      return res.status(200).json({ message: "Content creator deleted successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;