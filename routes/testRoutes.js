const router = require("express").Router();
const requireLogin = require('../middlewares/requireLogin')

// Route for testing JWT verification on private routes

router.get("/require-jwt", requireLogin, (req, res) => {
  console.log(req.headers.token)
  // Mirror the input for testing
  res.status(200).send(req.body);
})

module.exports = router;