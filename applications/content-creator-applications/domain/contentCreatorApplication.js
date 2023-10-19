module.exports = function buildMakeContentCreatorApplication({ Id }) {

	return function makeContentCreatorApplication({
		id = Id.makeId(),
		firstName,
		lastName,
		email,
		motivation,
		approved = false,
		createdAt = new Date(),
		modifiedAt = new Date()
	}) {

		if (!firstName) throw new Error('A firstname must be provided in the application');
		if (!lastName) throw new Error('A lastname must be provided in the application');
		if (!email) throw new Error('An email must be provided in the application');

		let rejectReason = '';

		return Object.freeze({
			getId: () => id,
			getFirstName: () => firstName,
			getLastName: () => lastName,
			getEmail: () => email,
			getMotivation: () => motivation,
			isApproved: () => approved,
			getRejectReason: () => rejectReason,
			getCreatedAt: () => createdAt,
			getModifiedAt: () => modifiedAt,
			fullname: () => `${firstName} ${lastName}`,
			approve: () => approved = true,
			decline: ({ reason = 'No reason given' } = {}) => {
				approved = false;
				rejectReason = reason;
			}
		});
	};
};