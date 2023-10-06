const mongoose = require('mongoose')

let connection, db

module.exports = async function connectDb() {
    connection =
        connection ||
        await mongoose.connect(
            global.__MONGO_URI__,
            {
                useNewUrlParser: true,
                useFindAndModify: false
            }
        )
    //db = db || connection.db(global.__MONGO_DB_NAME__)
}