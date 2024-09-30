module.exports = function makeFakeEmailVerificationToken(token='1234') {
	return {
		userEmail: 'fake@gmail.com',
		token: token,
		expiresAt: new Date() + 1000 * 60 * 60 * 24 * 7,
	};
};