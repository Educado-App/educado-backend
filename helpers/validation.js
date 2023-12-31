const { patterns } = require('../helpers/patterns');
const { UserModel } = require('../models/Users');
const errorCodes = require('../helpers/errorCodes');
const {compare} = require('../helpers/password');

async function validateEmail(input) {
	const emailPattern = patterns.email;

	if (isMissing(input)) {
		throw errorCodes['E0208']; // Email is required
	}
	if (input.length < 6) {
		throw errorCodes['E0207']; // Email must be at least 6 characters
	}
	if (!input.includes('@') || !input.includes('.')) {
		throw errorCodes['E0206']; // Email must contain "@" and "."
	}
	/**
   * Email must contain a sequence of any letters, numbers or dots
   * followed by an @ symbol, followed by a sequence of any letters
   * followed by a dot, followed by a sequence of two to four domain 
   * extension letters.
   */

	if (await UserModel.findOne({email: input}) != null) {
		throw errorCodes['E0201']; // User with the provided email already exists
	}
	if (!(emailPattern.test(input))) {
		throw errorCodes['E0203']; // Invalid email format
	}

	return true;
}

function validateName(input) {
	if (isMissing(input)) {
		throw errorCodes['E0209']; // First and last name are required
	}
	if (input.length < 1 || input.length > 50) {
		throw errorCodes['E0210']; // Names must be between 1 and 50 characters
	}
 
	/**
   * Name can contain a sequence of any letters (including foreign 
   * language letters such as ñ, Д, and 盘) followed by
   * a space, hyphen or apostrophe, repeated any number of times,
   * and ending with a sequence of any letters (at least one name). 
   */
	if(!(input.match(/^(\p{L}+[ -'])*\p{L}+$/u))){
		throw errorCodes['E0211']; // Name must only contain letters, spaces, hyphens and apostrophes.
	}

	return true;
}

function validatePassword (input) {
	const passwordPattern = patterns.password;

	if (isMissing(input)) {
		throw errorCodes['E0212']; // Password is required
	}
	if (input.length < 8) {
		throw errorCodes['E0213']; // Password must be at least 8 characters
	}
	if (!(passwordPattern.test(input))) {
		throw errorCodes['E0214']; // Password must contain at least one letter
	}

	return true;
}

function isMissing(input) {
	return input === undefined || input === null || input === '';
}

function validatePoints(input) {
	if (isMissing(input)) {
		throw errorCodes['E0703']; // Points are required
	}
  
	if (isNaN(input)) {
		throw errorCodes['E0702']; // Invalid points format
	}
  
	if (input <= 0) {
		throw errorCodes['E0701']; // Points added is less than or equal to 0
	}
  
	return true;
}

function ensureNewValues(newValues, oldValues) {
	const newEntries = Object.entries(newValues);

	for (const [fieldName, fieldValue] of newEntries) {
		if (fieldName === 'password' && compare(fieldValue, oldValues.password)) {
			return false;
		} else if (fieldValue === oldValues[fieldName]) {
			return false;
		}
	}

	return true;
}

module.exports = {
	validateEmail,
	validateName,
	validatePoints,
	validatePassword,
	isMissing,
	ensureNewValues,
};
