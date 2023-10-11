const { encrypt } = require('../../helpers/password');

module.exports = function makeFakeUser() {

	return {
		email: 'fake@gmail.com',
		password: encrypt('ABC123456!'),
		googleID: '1234567891011',
		joinedAt: new Date(),
		modifiedAt: new Date(),
		subscriptions: [ 
			{ _id: 'testSub123'}
		]
	};
};
