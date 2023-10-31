const router = require('express').Router();
const { encrypt } = require('../helpers/password');
const { validateEmail, validateName } = require('../helpers/validation');
const { ContentCreator } = require('../models/ContentCreator');
const { UserModel } = require('../models/Users');
const errorCodes = require('../helpers/errorCodes');

// Content Creator Application Route
router.post('/content-creator', async (req, res) => {
	const form = req.body;

	// Validate form ...
	try {
		const doc = ContentCreator(form);
		const created = await doc.save();

		res.status(201);
		res.send(created);
	} catch (error) {
		res.status(400);
		res.send(error.message);
	}
});


module.exports = router;