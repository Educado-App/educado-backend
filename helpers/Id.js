const mongoose = require('mongoose');

module.exports = Object.freeze({
	makeId : () => new mongoose.Types.ObjectId(),
	isValid
});

function isValid(id) {
	return mongoose.Types.ObjectId.isValid(id);
}