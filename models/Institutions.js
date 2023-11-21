// Mongoose model class for Institutions
const mongoose = require("mongoose");
const { Schema } = mongoose;

const InstitutionSchema = new Schema({
    institutionName: String,
    domain: String,
    secondaryDomain: {type: String, default: null}

});

const InstitutionModel = mongoose.model(
    "institutions",
    InstitutionSchema
  );
  
  module.exports = { InstitutionModel };