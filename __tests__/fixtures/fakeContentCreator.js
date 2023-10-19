const { encrypt } = require('../../helpers/password');
const mongoose = require('mongoose');

module.exports = function makeFakeCreator() {
  return {
    email: "test1@mail.dk",
    password: encrypt('ABC123456!'),
    name: "test1 test1",
    approved: true
  }
}