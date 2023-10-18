const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  ContentCreator,
} = require("../models/ContentCreatorApplication");

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCreator = await ContentCreator.findByIdAndDelete(id);

    if (!deletedCreator) {
      return res.status(204).json({ 'error': errorCodes['E0013'] });
    } else {
      return res.status(200).json({ message: "Content creator deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ 'error': errorCodes['E0003'] });
  }
});



module.exports = router;