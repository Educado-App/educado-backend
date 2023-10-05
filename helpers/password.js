const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

module.exports = Object.freeze({
	encrypt,
	compare: bcrypt.compareSync
});

function encrypt(plainPassword) {
	return bcrypt.hashSync(plainPassword, SALT_ROUNDS);
}