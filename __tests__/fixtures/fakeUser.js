const { encrypt } = require('../../helpers/password');
const mongoose = require('mongoose');

module.exports = function makeFakeUser(email = 'fake@gmail.com', attempts = []) {
    return {
        email: email,
        password: encrypt('ABC123456!'),
        googleID: '1234567891011',
        joinedAt: new Date('2020-01-01'),
        modifiedAt: new Date('2020-01-01'),
        firstName: 'Fake first name',
        lastName: 'Fake last name',
        resetAttempts: attempts,
    }
}
