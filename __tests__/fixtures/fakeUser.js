const { encrypt } = require('../../helpers/password');
const mongoose = require('mongoose');

module.exports = function makeFakeUser(email = 'fake@gmail.com', attempts = []) {
    return {
        email: email,
        password: encrypt('ABC123456!'),
        googleID: '1234567891011',
        joinedAt: new Date(),
        modifiedAt: new Date(),
        firstName: 'Fake first name',
        lastName: 'Fake last name',
        resetAttempts: attempts,
        subscriptions: []
    }
}
