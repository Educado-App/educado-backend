const mongoose = require('mongoose');
const { Schema } = mongoose;

const sectionSchema = new Schema({
	title: String,
	description: String,
	components: [{
		compId: { type: Schema.Types.ObjectId },
		compType: { type: String, enum: ['lecture', 'exercise'] },
	}],
	sectionNumber: Number,
	totalPoints: {
		type: Number,
		required: true
	},
	dateCreated: {
		type: Date,
		required: true,
		default: Date.now
	},
	dateUpdated: {
		type: Date,
		required: true,
		default: Date.now
	},
	parentCourse: { type: Schema.Types.ObjectId, ref: 'courses' }
});

const SectionModel = mongoose.model('sections', sectionSchema);

module.exports = { SectionModel };