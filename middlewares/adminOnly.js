const { verify } = require('../helpers/token');

const ADMIN_ID = 'srdfet784y2uioejqr'

module.exports = (req, res, next) => {
	try {
		const claims = verify(req.headers.token ?? '');
    if(claims.id !== ADMIN_ID) {
      return res.status(401).send({ error: 'You are not allowed to access this content!' });
    }
		next();
	} catch {
		// TODO: add updated error messages
		return res.status(401).send({ error: 'You must be logged in to acces this content!' });
	}
};