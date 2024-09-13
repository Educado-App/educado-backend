const router = require('express').Router();
const { UserModel } = require('../models/Users'); // Import User model
const { ContentCreatorModel } = require('../models/ContentCreators'); // Import Content Creator model
const { InstitutionModel } = require('../models/Institutions'); //Import Institution model 
const { StudentModel } = require('../models/Students'); // Import Student model

const { makeExpressCallback } = require('../helpers/express');
const { authEndpointHandler } = require('../auth');
const { signAccessToken } = require('../helpers/token');
const { compare, encrypt } = require('../helpers/password');
const errorCodes = require('../helpers/errorCodes');
const { sendResetPasswordEmail } = require('../helpers/email');
const { PasswordResetToken } = require('../models/PasswordResetToken');
const { EmailVerificationToken } = require('../models/EmailVerificationToken');
const { validateEmail, validateName, validatePassword } = require('../helpers/validation');
const { sendVerificationEmail } = require('../helpers/email');


const TOKEN_EXPIRATION_TIME = 1000 * 60 * 5;
const ATTEMPT_EXPIRATION_TIME = 1; //1000 * 60 * 60;

// Services
//require("../services/passport");

router.post('/', makeExpressCallback(authEndpointHandler));

// Login
router.post('/login', async (req, res) => {
	let result;
	let profile;
	if (!req.body.email || !req.body.password) {
		return res.status(400).json({ error: errorCodes['E0202'] }); //Password or email is missing
	}

	try {
		// Searching for a single user in the database, with the email provided in the request body. 
		const user = await UserModel.findOne({ email: { $regex: req.body.email, $options: 'i' } });
		// If email is found, compare the password provided in the request body with the password in the database
		if (!user) {
			// Invalid email (email not found)
			return res.status(401).json({'error': errorCodes['E0004']});
		}
	
		// For content creators, a matching content-creator entry will be found to see if they are approved or rejected
		if(req.body.isContentCreator == true) {
			profile = await ContentCreatorModel.findOne({baseUser: user._id});
			//Content creator must not be allowed entry if they are either rejected or not yet approved
			if (profile.approved == false && profile.rejected == false) {
				// User not approved
				return res.status(403).json({'error': errorCodes['E1001']});
			}

			if (profile.rejected == true && profile.approved == false) {
				// User is rejected
				return res.status(403).json({'error': errorCodes['E1002']});
			}

		} else {
			profile = await StudentModel.findOne({baseUser: user._id});
		}


		// If the email is found, and content creator is approved compare the passwords
		result = compare(req.body.password, user.password);
		// If the passwords match, return a success message
		if (result) {
			// Create a token for the user
			const token = signAccessToken({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email });
			// Return the token
			return res.status(202).json({
				status: 'login successful',
				accessToken: token,
				userInfo: {
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					courses: profile.courses,
					points: profile.points,
				},
			});
		} else {
			// If the passwords do not match, return an error message
			return res.status(401).json({ 'error': errorCodes['E0105'] });
		}
	} catch (err) {
		// If the server could not be reached, return an error message
		return res.status(500).json({ 'error': errorCodes['E0003'] });
	}
});

// Signup route
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Validate user input
        validateName(firstName);
        validateName(lastName);
        validatePassword(password);
        await validateEmail(email);

        // Generate and hash the verification token
        const verificationToken = generateVerificationToken();
        const hashedToken = await encrypt(verificationToken);

        // Save the token and email in the database
        await new EmailVerificationToken({
            userEmail: email,
            token: hashedToken,
            expiresAt: Date.now() + TOKEN_EXPIRATION_TIME,
        }).save();

        // Send verification email
        await sendVerificationEmail({ firstName, email }, verificationToken);

        // Respond to client
        res.status(200).json({
            message: 'Verification email sent. Please verify to complete registration.',
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Email verification route
router.post('/verify-email', async (req, res) => {
	const { token, email, password, firstName, lastName } = req.body;  // Destructure the token and user data
  
	try {
	  // Find the verification token by email
	  const emailVerificationToken = await EmailVerificationToken.findOne({ userEmail: email });
  
	  if (!emailVerificationToken) {
		return res.status(400).json({ error: 'Invalid or expired token.' });
	  }
  
	  // Check if the token matches
	  const isValid = await compare(token, emailVerificationToken.token); // Assuming compare is asynchronous
  
	  if (!isValid || emailVerificationToken.expiresAt < Date.now()) {
		return res.status(400).json({ error: 'Invalid or expired token.' });
	  }
  
	  // Token is valid, proceed to user creation
	  validatePassword(password);  // Validate password during user creation
  
	  const hashedPassword = await encrypt(password);  // Hash the password
  
	  // Create the user object
	  const newUser = new UserModel({
		firstName: firstName, // Use firstName from the request body
		lastName: lastName,
		email: email,
		password: hashedPassword,
		joinedAt: Date.now(),
		modifiedAt: Date.now()
	  });
  
	  // Save the user to the database
	  const createdUser = await newUser.save();
  
	  // Create content creator and student profiles linked to the user
	  const contentCreatorProfile = new ContentCreatorModel({ baseUser: createdUser._id });
	  const studentProfile = new StudentModel({ baseUser: createdUser._id });
  
	  // Save the profiles
	  await contentCreatorProfile.save();
	  await studentProfile.save();
  
	  // Delete the verification token since it's no longer needed
	  await EmailVerificationToken.deleteOne({ userEmail: email });
  
	  // Respond with the created user data
	  res.status(201).json({
		message: 'Email verified and user created successfully!',
		user: createdUser
	  });
  
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });
  



router.post('/reset-password-request', async (req, res) => {
	const { email } = req.body;
	const user = await UserModel.findOne({ email: email });

	// If email is not provided or user is not found, return error E0401
	if (!email || !user) {
		return res.status(400).json({ error: errorCodes['E0401'] });
	}

	// Delete any attempts older than 1 hour
	if (user.resetAttempts != null) {
		user.resetAttempts.forEach(async (attempt) => {
			if (attempt === null || attempt < (Date.now() - ATTEMPT_EXPIRATION_TIME)) {
				user.resetAttempts.remove(attempt);
				await UserModel.updateOne({ _id: user._id }, user);
			}
		});
	} else {
		user.resetAttempts = [];
		await UserModel.updateOne({ _id: user._id }, user);
	}
	// If there are more than 2 attempts in the last hour, return error E0406
	if (user.resetAttempts.length >= 2) {
		return res.status(400).json({ error: errorCodes['E0406'] });
	}

	user.resetAttempts.push(Date.now());

	await UserModel.updateOne({ _id: user._id }, user);

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
		expiresAt: Date.now() + TOKEN_EXPIRATION_TIME // 5 minutes
	}).save();

	// Send email with reset token
	const success = await sendResetPasswordEmail(user, resetToken);

	// Return success if email is sent, else return error code E0004
	if (success) {
		return res.status(200).json({ status: 'success' });
	} else {
		return res.status(500).json({ error: errorCodes['E0004'] });
	}
});

router.post('/reset-password-code', async (req, res) => {
	const { email, token } = req.body;
	const user = await UserModel.findOne({ email: email });

	// If email is not provided or user is not found, return error E0401
	if (!user) {
		return res.status(400).json({ error: errorCodes['E0401'] });
	}

	const passwordResetToken = await PasswordResetToken.findOne({ userId: user._id });
	const isValid = compare(token, passwordResetToken.token);

	// If token is invalid, return error E0405
	if (!isValid) {
		return res.status(400).json({ error: errorCodes['E0405'] });
	}
	// return success
	return res.status(200).json({ status: 'success' });

});

router.patch('/reset-password', async (req, res) => {
	const { email, token, newPassword } = req.body;
	const user = await UserModel.findOne({ email: email });

	if (!user) { // If email is not provided or user is not found, return error E0401
		return res.status(400).json({ error: errorCodes['E0401'] });
	}
	const passwordResetToken = await PasswordResetToken.findOne({ userId: user._id });

	// If token is not provided or token is expired, return error E0404
	if (!passwordResetToken || passwordResetToken.expiresAt < Date.now()) {
		return res.status(400).json({ error: errorCodes['E0404'] });
	}
	const isValid = compare(token, passwordResetToken.token);

	// If token is invalid, return error E0405
	if (!isValid) {
		return res.status(400).json({ error: errorCodes['E0405'] });
	}

	// Update password and delete token
	user.password = await encrypt(newPassword);
	await UserModel.updateOne({ _id: user._id }, user);
	await passwordResetToken.deleteOne();

	// Return success
	return res.status(200).json({ status: 'success' });
});

// Logout simulation
router.post('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// Show current user simulation
router.get('/current_user', (req, res) => {
	setTimeout(() => {
		res.send(req.user);
	}, 1500);
});

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
// Generate a random 4 digit code for Email Verification
function generateVerificationToken() {
    const length = 4;  // Make it 6 characters long (can be customized)
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