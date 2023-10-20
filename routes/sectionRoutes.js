const router = require('express').Router();

// Models
const { SectionModel } = require('../models/Sections');

// Get all sections
router.get('/', async (req, res) => {
  const list = await SectionModel.find();
  res.send(list);
});

// Get specific section
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const section = await SectionModel.findById(id);
  res.send(section);
});

module.exports = router;