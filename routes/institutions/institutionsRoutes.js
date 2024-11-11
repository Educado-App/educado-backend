const router = require('express').Router();

// models
const { InstitutionModel } = require('../../models/Institutions');

const errorCodes = require('../../helpers/errorCodes');
const { handleFieldAlreadyInUseErrorInfo, validateInstitutionFields } = require('./institutionsUtility');
const { validateId } = require('../../middlewares/validateId');
const adminOnly = require('../../middlewares/adminOnly');

//read all
router.get('/', adminOnly, async (req, res) => {
	try {
		const institutions = await InstitutionModel.find();
		res.send(institutions);
	} catch (err) {
		console.error(err);
		res.status(500).send({ error: errorCodes['E0000']});
	}
});

//read one
router.get('/:id', [validateId, adminOnly], async (req, res) => {
	//objectId added to req by validateId
	const objectId = req.objectId;

	try {
		const institution = await InstitutionModel.findById(objectId);

		if (!institution) {
			return res.status(404).send({ error: errorCodes['E1206']});
		}

		res.send(institution);
	} catch (err) {
		console.error(err);
		res.status(500).send({ error: errorCodes['E0000']});
	}
});

//create
router.post('/', adminOnly, async (req, res) => {
	const { institutionName, domain, secondaryDomain } = req.body;

	//missing fields
	if(!institutionName || !domain) {
		return res.status(400).send({ error: errorCodes['E0016']});
	}

	//invalid fields
	const isFieldsValid = validateInstitutionFields(institutionName, domain, secondaryDomain);
	if (!isFieldsValid) {
		return res.status(400).send({ error: errorCodes['E0016']});
	}
    
	try {
		const newInstitution = await new InstitutionModel({ institutionName, domain, secondaryDomain}).save();
		res.location(`/institutions/${newInstitution.id}`);
		res.status(201).send(newInstitution);

	} catch (err) {
		switch (err.code) {
		//field already in use
		case 11000:
			handleFieldAlreadyInUseErrorInfo(err, res);
			break;
		default:
			console.error(err);
			res.status(500).send({ error: errorCodes['E0000']});
			break;
		}
	}
});
// Update the secondary domain
router.patch('/:id', [validateId, adminOnly], async (req, res) => {
	const objectId = req.objectId;
	const { institutionName, domain, secondaryDomain } = req.body;
	// Check for missing fields
	if (!institutionName || !domain) {
		return res.status(400).send({ error: errorCodes['E0016'] });
	}

	// Check for invalid fields
	const isFieldsValid = validateInstitutionFields(institutionName, domain, secondaryDomain);
	if (!isFieldsValid) {
		return res.status(400).send({ error: errorCodes['E0016'] });
	}

	try {
		// Update institution and return the updated document
		const updatedInstitution = await InstitutionModel.findByIdAndUpdate(
			objectId,
			{ institutionName, domain, secondaryDomain },
			{ new: true } // Add this option to return the updated document
		);
		
		// Check if the institution was found
		if (!updatedInstitution) {
			return res.status(404).send({ error: errorCodes['E1206'] });
		}

		// Return a success response
		res.status(200).send({ message: 'Institution updated successfully', institution: updatedInstitution });
	} catch (err) {
		switch (err.code) {
		// Field already in use
		case 11000:
			handleFieldAlreadyInUseErrorInfo(err, res);
			break;
		default:
			console.error(err);
			res.status(500).send({ error: errorCodes['E0000']});
			break;
		}
	}
});

//delete
router.delete('/:id', [validateId, adminOnly], async (req, res) => {
	const objectId = req.objectId;

	try {
		const institutionExists= await InstitutionModel.exists(objectId);

		if (!institutionExists) {
			return res.status(404).send({ error: errorCodes['E1206'] });
		}

		const deletedInstitution = await InstitutionModel.findByIdAndDelete(objectId);
		res.status(200).send(deletedInstitution);
	} catch (err) {
		console.error(err);
		res.status(500).send({ error: errorCodes['E0000']});
	}
});

module.exports = router;
