const router = require("express").Router();

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Models
/*
const {
  ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");

router.delete("/profile/delete/:id", async (req, res) => {
    try {
      // Get the authenticated creator's ID from req.creator.id
      const { id } = req.params;
  
      // Use Mongoose to find and delete the user by ID
      console.log("Deleting creator with ID:", id)
      await User.findByIdAndDelete(id);
  
      // Send a success response
      res.status(200).json({ message: "Content creator deleted successfully" });
    } catch (error) {
      // Handle any errors and send an error response
      console.error("Error deleting content creator:", error);
      res.status(500).json({ error: "An error occurred while deleting the content creator" });
    }
  });
*/