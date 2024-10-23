const mongoose = require('mongoose');

module.exports = function makeFakeFeedbackOptions() {
	const id = mongoose.Types.ObjectId();
	return [ {
		_id: id,
		count: 10
	}];
};