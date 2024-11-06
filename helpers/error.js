/**
 * Allows for an object to be passed as a message
 */
class MultipleError extends Error {

	constructor(message = {}) {
		super();
		super.message = message;
	}
}

//used to put errorcode in a context instead of just the message
class CustomError extends Error {
	constructor(errorCode) {
		super(errorCode.message);
		this.name = this.constructor.name;
		this.code = errorCode.code;
	}
}


function makeHttpError({ status = 500, message }) {
	
	return {
		success: false,
		status,
		errors: message
	};
}

//Asserts used for errorhandling
function assert(condition, errorcode) {
	if (!condition) {
		throw new CustomError(errorcode);
	}
}



module.exports = { assert, makeHttpError, MultipleError, CustomError };