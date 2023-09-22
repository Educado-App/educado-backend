const router = require('express').Router()
const passport = require("passport"); // Import passport library module
const { User } = require("../models/User"); // Import User model

const { makeExpressCallback } = require('../helpers/express')
const { authEndpointHandler } = require('../auth')

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
router.get("/auth/login", async (req, res) => {
  try {
    // Searching for a single user in the database, with the email provided in the request body
    const user = await User.findOne({ email: req.body.email });
    // If email is found, compare the password provided in the request body with the password in the database
    if (!user) {
      return res.status(401).json({ "error": "Incorrect credentials" });
    } else {
      result = (req.body.password === user.password)
    }
    // If the passwords match, return a success message
    if (result) {
      return res.status(202).json({ "message": "Login successful" });
    } else {
      return res.status(401).json({ "error": "Incorrect credentials" });
    }
  } catch { return res.status(404).json({ "error": "Error" }) }
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
