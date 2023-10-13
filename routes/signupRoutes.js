const router = require('express').Router();
const { encrypt } = require('../helpers/password');
const { validateEmail, validateName } = require('../helpers/validation');
const { ContentCreatorApplication } = require('../models/ContentCreatorApplication');
const { UserModel } = require('../models/Users');
const errorCodes = require('../helpers/errorCodes');

// Content Creator Application Route
router.post('/content-creator', async (req, res) => {
	const form = req.body;

	// Validate form ...
	try {
		const doc = ContentCreatorApplication(form);
		const created = await doc.save();

		res.status(201);
		res.send(created);
	} catch (error) {
		res.status(400);
		res.send(error.message);
	}
});

router.post('/user', async (req, res) => {
	const form = req.body;
	form.joinedAt = Date.now();
	form.modifiedAt = Date.now();

	// Validate form ...
	try {
		// Validate user info
		if(isMissing(form.password)){
			throw errorCodes['E0212']; // Password is required
		}
		const nameValid = validateName(form.firstName) &&
                      validateName(form.lastName);
                      
		const emailValid = await validateEmail(form.email);

		if(nameValid && emailValid) {
			// Hashing the password for security
			const hashedPassword = encrypt(form.password);
			//Overwriting the plain text password with the hashed password 
			form.password = hashedPassword;
			const doc = UserModel(form);
			const created = await doc.save();  // Save user
			res.status(201);
			res.send(created);
		} 
  
	} catch (error) {
		console.log(error);
		res.status(400);
		res.send({
			error: error
		});
	}
});

module.exports = router;

function isMissing(input) {
	return input === undefined || input === null || input === '';
}