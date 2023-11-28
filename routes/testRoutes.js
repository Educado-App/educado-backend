const router = require('express').Router();
const adminOnly = require('../middlewares/adminOnly');
const requireLogin = require('../middlewares/requireLogin');

// Route for testing JWT verification on private routes

router.get('/require-jwt', requireLogin, (req, res) => {
  // Mirror the input for testing
  res.status(200).send(req.body);
});

router.get('/adminOnly', adminOnly, (req, res) => {
  res.status(200).send(req.body);
});

module.exports = router;