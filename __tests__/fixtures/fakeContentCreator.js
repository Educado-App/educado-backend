const { encrypt } = require('../../helpers/password');
const mongoose = require('mongoose');

module.exports = function makeFakeContentCreator(email = 'fake@gmail.com') {
    return {
        email: email,
        password: encrypt('ABC123456!'),
        name: 'Fake name',
    }
}
