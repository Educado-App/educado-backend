const errorCodes = require('../helpers/errorCodes');
const { verify } = require('../helpers/token');

const ADMIN_ID = 'srdfet784y2uioejqr';

module.exports = (req, res, next) => {
	try {
		const claims = verify(req.headers.token ?? '');
		if(claims.id !== ADMIN_ID) {
			return res.status(401).send({ error: errorCodes['E0001'] });
		}
		next();
	} catch {
		// TODO: add updated error messages
		return res.status(401).send({ error: errorCodes['E0002'] });
	}
};