const errorCodes = require('../../helpers/errorCodes');

const handleFieldAlreadyInUseErrorInfo = (err, res) => {
	const fieldAlreadyInUse = Object.keys(err.keyPattern)[0];

	let repeatedFieldErrorCode;
	if (fieldAlreadyInUse === 'institutionName') repeatedFieldErrorCode = 'E1205';
	else if (fieldAlreadyInUse === 'domain') repeatedFieldErrorCode = 'E1203';
	else if (fieldAlreadyInUse === 'secondaryDomain') repeatedFieldErrorCode = 'E1204';
	else return res.status(500).send({ error: errorCodes['E1206'] });
				
	return res.status(400).send({ error: errorCodes[repeatedFieldErrorCode] });
};

const validateInstitutionFields = (institutionName, domain, secondaryDomain) => {
	const isMandatoryFieldsValid = typeof institutionName === 'string' && typeof domain === 'string';
	const isSecondaryDomainValid = secondaryDomain && typeof secondaryDomain === 'string';
	const isDomainsTheSame = domain === secondaryDomain;

	return (isMandatoryFieldsValid && isSecondaryDomainValid && !isDomainsTheSame);
};

module.exports = {
	handleFieldAlreadyInUseErrorInfo,
	validateInstitutionFields
};
