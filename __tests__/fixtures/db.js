const mongoose = require('mongoose');

let connection, db;

module.exports = async function connectDb() {
  
  connection =
    connection ||
    await mongoose.connect(
      global.__MONGO_URI__,
      {
        useNewUrlParser: true,
        useFindAndModify: false
      }
    );
  //db = db || connection.db(global.MONGO_DB_NAME)
  db = db || connection.connection.db; // Assign the database object

  return db; // Return the database object
};