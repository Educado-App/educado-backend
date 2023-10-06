const { MultipleError } = require('../error');
const Ajv = require('ajv');
const ajv = new Ajv({ coerceTypes: true });
require('ajv-formats')(ajv, { mode: 'fast', formats: ['date', 'time'], keywords: true });

module.exports = Object.freeze({
	validate
});

/**
 * Uses Ajv schema parsing for validation of data
 * For examples and documentation:
 * @see https://ajv.js.org/guide/getting-started.html
 * @returns Validated data, coerced into respective types
 */
function validate({ schema, data }) {

	const _validate = ajv.compile(schema);
	const valid = _validate(data);
	if (!valid) {
		throw new MultipleError(formatAjvErrors(_validate.errors));
	}

	return data;
}

function formatAjvErrors(errors) {
	const formatted = errors.map((error) => {

		const queryParameter = error.instancePath.replace('/', '');
		const message = error.message;

		const base = {
			queryParameter,
			message
		};

		const extras = {};
		error.params.allowedValues ? extras['allowedValues'] = error.params.allowedValues : null;

		return {
			...base,
			...extras
		};
	});

	return formatted;
}