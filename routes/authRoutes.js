const router = require('express').Router()
const passport = require("passport"); // Import passport library module
const { User } = require("../models/User"); // Import User model

const { makeExpressCallback } = require('../helpers/express');
const { authEndpointHandler } = require('../auth');
const auth = require('../helpers/password');

const errorCodes = require('../helpers/errorCodes');

// Services
require("../services/passport");

router.post('/auth', makeExpressCallback(authEndpointHandler))

// Route handler for login simulation
router.get("/auth/google",
  passport.authenticate("google-restricted", {
    // 'google' identifies a GoogleStrategy
    scope: ["profile", "email"], // Specifies to google what access we request access to. Full list of possibilities can be seen on google.
  })
);

// Route handler for auth callback (Automatically gets 'code' from earlier call)
router.get("/auth/google/callback",
  passport.authenticate("google-restricted"),
  (req, res) => {
    res.redirect("/");
  }
);

// Login
router.post("/auth/login", async (req, res) => {
  try {
    console.log(req.body);
    // Searching for a single user in the database, with the email provided in the request body
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Invalid email 
      return res.status(401).json({ 'error': errorCodes['E0101'] });
    }
    // If email is found, compare the password provided in the request body with the password in the database
    const passwordCorrect = auth.compare(req.body.password, user.password);

    // If the passwords don't match, return an error
    if (!passwordCorrect) {
      // Invalid  password
      return res.status(401).json({ 'error': errorCodes['E0105'] });
    }
    // All validation passed, log in the user
    return res.status(202).json({ "message": "Login successful" });
  } catch {
    return res.status(404).json({ "error": "Error" })
  }
});


// Logout simulation
router.get("/auth/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Show current user simulation
router.get("/auth/current_user", (req, res) => {
  setTimeout(() => {
    res.send(req.user);
  }, 1500);
});

module.exports = router
