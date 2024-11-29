const errorCodes = require('../helpers/errorCodes');
const { verify } = require('../helpers/token');

module.exports = (req, res, next) => {
	let claims;

	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			console.error('Authorization header missing or invalid');
			return res.status(401).send({ error: errorCodes['E0001'] });
		}

		const token = authHeader.split(' ')[1];
		claims = verify(token);
		if (claims.role === 'admin') {
			return next();
		} else {
			return res.status(401).send({ error: errorCodes['E0001'] });
		}
	} catch {
		return res.status(401).send({ error: errorCodes['E0001'], message: 'Authentication token is invalid or expired.' });
	}
};