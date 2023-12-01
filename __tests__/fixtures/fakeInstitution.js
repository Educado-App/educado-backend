module.exports = function makeFakeInstitution(institutionName, domain, secondaryDomain) {
	return {
		//Created like this as to easily dictate their values for the purpose of the individual tests
		institutionName: institutionName,
		domain: domain,
		secondaryDomain: secondaryDomain,
	};
};
