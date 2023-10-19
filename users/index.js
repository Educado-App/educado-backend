const { UserModel } = require('../models/Users');
const Email = require('../helpers/email');
const Password = require('../helpers/password');

const makeUserList = require('../users/userList');
const userList = makeUserList(UserModel);

const buildMakeUser = require('../users/user');
const makeUser = buildMakeUser({ Email, Password });

module.exports = { makeUser, userList };