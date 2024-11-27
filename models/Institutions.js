// Mongoose model class for Institutions
const mongoose = require('mongoose');
const { Schema } = mongoose;

const InstitutionSchema = new Schema({
	institutionName: { type: String, required: true, unique: true },
	domain: { type: String, required: true, unique: true },
	secondaryDomain: { type: String, default: null }
});

// Pre-save hook to remove secondaryDomain if it is null or an empty string
InstitutionSchema.pre('save', function(next) {
	if (!this.secondaryDomain || this.secondaryDomain === '') {
		this.secondaryDomain = undefined;
	}
	next();
});

const InstitutionModel = mongoose.model('institutions', InstitutionSchema);

module.exports = { InstitutionModel };
