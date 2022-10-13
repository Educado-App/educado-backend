const mongoose = require("mongoose");

function connectToDb(uri, options = {}) {
  mongoose.connect(uri, options);

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error"));

  _db = db;
}

module.exports = { connectToDb };
