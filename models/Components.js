const mongoose = require('mongoose');
const { Schema } = mongoose;

const component = new Schema({
  _id: Schema.Types.ObjectId,
  fileName: String,
  path: String,
  size: Number,
  type: String,
});

module.exports = { component };
