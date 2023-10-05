/**
 * Uses AJV Json schema definitions to extend a schema with some common
 * query parameters
 * @param {*} overides 
 * @returns 
 */
function extendFindAllSchema(overides = {}) {

	const base = {
		type: 'object',
		properties: {
			'sortBy': { enum: ['createdAt', '-createdAt'] },
			'limit': { type: 'integer', minimum: 0 },
			'offset': { type: 'integer', minimum: 0 }
		}
	};

	return {
		...base,
		...overides,
		properties: {
			...base.properties ,
			...overides.properties,
		}
	};
}

module.exports = { extendFindAllSchema };