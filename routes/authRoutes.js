const router = require('express').Router();
const { User } = require('../models/User'); // Import User model

const { makeExpressCallback } = require('../helpers/express');
const { authEndpointHandler } = require('../auth');
const { signAccessToken } = require('../helpers/token');
const { compare } = require('../helpers/password');
const errorCodes = require('../helpers/errorCodes');

// Services
//require("../services/passport");

router.post('/auth', makeExpressCallback(authEndpointHandler));

/* Commented out until google login is implemented correctly
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

*/

// Login
router.post('/auth/login', async (req, res) => {
	try {
		console.log(req.body);
		// Searching for a single user in the database, with the email provided in the request body
		const user = await User.findOne({ email: req.body.email});
		// If email is found, compare the password provided in the request body with the password in the database
		if (!user) {
			// Invalid email (email not found)
			return res.status(401).json({ 'error': errorCodes['E0101']});
		} else {
			// If the email is found, compare the passwords
      
			result = compare(req.body.password, user.password);
		}
		// If the passwords match, return a success message
		if (result) {
			// Create a token for the user
			const token = signAccessToken({ id: user.id });
			// Return the token
			return res.status(202).json({
				status: 'login successful',
				accessToken: token,
				user: {
          name: user.name,
          email: user.email,
          id: user.id,
				},
			});
		} else {
			// If the passwords do not match, return an error message
			return res.status(401).json({ 'error': errorCodes['E0105']});
		}
	} catch (err) { 
		// If the server could not be reached, return an error message
		console.log(err);
		return res.status(500).json({ 'error': errorCodes['E0003']});
	}
});


// Logout simulation
router.get('/auth/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// Show current user simulation
router.get('/auth/current_user', (req, res) => {
	setTimeout(() => {
		res.send(req.user);
	}, 1500);
});

module.exports = router;
