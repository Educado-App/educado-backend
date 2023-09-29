const mongoose = require('mongoose');

module.exports = function makeFakeUser() {
    const objectId = new mongoose.Types.ObjectId();

    return {
        id: objectId.toString(), // Convert the ObjectId to a string
        email: "fake@gmail.com",
        password: "ABC123456!",
        googleID: "1234567891011",
        joinedAt: new Date(),
        modifiedAt: new Date(),
        firstName: "Fake first name",
        lastName: "Fake last name"
    }
}
