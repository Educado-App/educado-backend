// Mongoose model class for Courses
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Class description
const sectionSchema = new Schema({
	title: String,
	description: String,
	dateCreated: Date,
	dateUpdated: Date,
	components: [{ type: Schema.Types.ObjectId, ref: 'Component' }],
});

const SectionModel = mongoose.model('sections', sectionSchema);

module.exports = { SectionModel };
