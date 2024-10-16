// Mongoose model class for Institutions
const mongoose = require('mongoose');
const { Schema } = mongoose;

const InstitutionSchema = new Schema({
	institutionName: { type: String, requried: true, unique: true },
	domain: { type: String, requried: true, unique: true },
	secondaryDomain: { type: String, default: null, unique: true }

});

const InstitutionModel = mongoose.model(
	'institutions',
	InstitutionSchema
);
  
module.exports = { InstitutionModel };
