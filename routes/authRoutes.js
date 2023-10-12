const router = require('express').Router();
const { User } = require('../models/User'); // Import User model

const { makeExpressCallback } = require('../helpers/express');
const { authEndpointHandler } = require('../auth');
const { signAccessToken } = require('../helpers/token');
const { compare, encrypt } = require('../helpers/password');
const errorCodes = require('../helpers/errorCodes');
const send = require('send');
const { sendResetPasswordEmail } = require('../helpers/email');
const { PasswordResetToken } = require('../models/PasswordResetToken');

const EXPIRATION_TIME = 1000 * 60 * 5;

// Services
//require("../services/passport");

router.post('/', makeExpressCallback(authEndpointHandler));

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
router.post('/login', async (req, res) => {
	try {
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

router.post('/reset-password-request', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  // If email is not provided or user is not found, return error E0401
  if (!email || !user) {
    return res.status(400).json({ error: errorCodes['E0401'] });
  }

  // Delete any existing token
  let token = await PasswordResetToken.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  // Generate new token
  let resetToken = generatePasswordResetToken();
  const hash = await encrypt(resetToken);

  // Save token to database with 5 minute expiration
  await new PasswordResetToken({
    userId: user._id,
    token: hash,
    expiresAt: Date.now() + EXPIRATION_TIME // 5 minutes
  }).save();

  // Send email with reset token
  const success = await sendResetPasswordEmail(user, resetToken);

  // Return success if email is sent, else return error code E0004
  if(success) {
    return res.status(200).json({ status: 'success' });
  } else {
    return res.status(500).json({ error: errorCodes['E0004'] });
  }
});

router.put('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email: email });

  if (!email || !user) { // If email is not provided or user is not found, return error E0401
    return res.status(400).json({ error: errorCodes['E0401'] });
  }
  const passwordResetToken = await PasswordResetToken.findOne({ userId: user._id});
  
  // If token is not provided or token is expired, return error E0404
  if (!passwordResetToken || passwordResetToken.expiresAt < Date.now()) {
    return res.status(400).json({ error: errorCodes['E0404'] });
  }
  const isValid = await compare(token, passwordResetToken.token);

  // If token is invalid, return error E0405
  if (!isValid) {
    return res.status(400).json({ error: errorCodes['E0405'] });
  }

  // Update password and delete token
  user.password = await encrypt(newPassword);
  await User.updateOne({ _id: user._id }, user);
  await passwordResetToken.deleteOne();

  // Return success
  return res.status(200).json({ status: 'success' });

});

// Logout simulation
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// Show current user simulation
router.get('/current_user', (req, res) => {
	setTimeout(() => {
		res.send(req.user);
	}, 1500);
});

module.exports = router;

/**
 * Generates a random 4 digit code for password reset
 * @returns {String} - 4 digit code as a string
 */
function generatePasswordResetToken() {
  const length = 4;
  let retVal = '';
  for (let i = 0; i < length; i++) {
    retVal += getRandomNumber(0, 9);
  }
  return retVal;
}

/**
 * Generates a random number between min and max
 * @param {Number} min - Minimum number
 * @param {Number} max - Maximum number
 * @returns {Number} Random number between min and max
 */
function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router; // Export the functions for testing