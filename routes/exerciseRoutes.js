const router = require('express').Router();

// Models
const { ExerciseModel } = require('../models/Exercises');

// Get all exercises
router.get('/', async (req, res) => {
  const list = await ExerciseModel.find();
  res.send(list);
});

// Get specific exercise
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const exercise = await ExerciseModel.findById(id);
  res.send(exercise);
});

module.exports = router;