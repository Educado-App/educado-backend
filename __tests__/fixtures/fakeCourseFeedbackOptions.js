const mongoose = require('mongoose');

module.exports = function makeCourseFakeFeedbackOptions() {
	const id = mongoose.Types.ObjectId();
	const id2 = mongoose.Types.ObjectId();
	return [ {
		_id: id,
		count: 10
	},
	{
		_id : id2,
		count : 5
	}];
};