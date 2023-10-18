const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  ContentCreator,
} = require("../models/ContentCreatorApplication");

router.delete("/profile/:id", async (req, res) => {
    try {
      // Get the authenticated creator's ID from req.creator.id
      const { id } = req.params;

      const creator = await ContentCreator.findById(id);

      console.log("Deleteing content creator:", creator);

      const deletedCreator = await ContentCreator.findByIdAndDelete(id);

      if (!deletedCreator) {
        console.log("Content creator not found.");
        return res.status(204).json({ error: 'Content creator not found' });
      } else {
        console.log("Content creator deleted successfully.");
        return res.status(200).json({ message: "Content creator deleted successfully" });
      }
    } catch (error) {
      // Handle any errors and send an error response
      console.error("Error deleting content creator:", error);
      res.status(500).json({ error: "An error occurred while deleting the content creator" });
    }

});



module.exports = router;