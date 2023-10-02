const { encrypt } = require('../../helpers/password');
const mongoose = require('mongoose');

module.exports = function makeFakeUser() {
    return {
        email: "fake@gmail.com",
        password: encrypt('ABC123456!'),
        googleID: "1234567891011",
        joinedAt: new Date(),
        modifiedAt: new Date(),
        firstName: "Fake first name",
        lastName: "Fake last name"
    }
}
