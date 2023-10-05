const Id = require('../../helpers/Id');

module.exports = function makeFakeContentCreatorApplication(overrides = {}) {

	const application = {
		id: Id.makeId(),
		firstName: 'Fake',
		lastName: 'User',
		email: 'fake@gmail.com',
		motivation: 'I am a test user who would like to create content on the educado platform',
		createdAt : new Date(),
		modifiedAt: new Date(),
		approved: false
	};

	return {
		...application,
		...overrides
	};
};