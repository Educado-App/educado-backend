const mongoose = require('mongoose');
const errorCodes = require('../helpers/errorCodes');
 
const validateId = async (req, res, next) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400).send({ error: errorCodes['E0014']});
	} else {
		req.objectId = mongoose.Types.ObjectId(id);
		next();
	}
};

module.exports = {
	validateId
};
