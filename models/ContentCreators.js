// Mongoose model class for User
const mongoose = require('mongoose');
const {Schema} = mongoose;

// Class description
const ContentCreatorSchema = new Schema({
	approved: { type: Boolean, default: false },
	rejected: { type: Boolean, default: false },
	rejectionReason: { type: String, required: false },
	baseUser: { type: Schema.Types.ObjectId, ref: 'Users' },
});

const ContentCreatorModel = mongoose.model(
	'content-creators',
	ContentCreatorSchema
);


module.exports = { ContentCreatorModel };

