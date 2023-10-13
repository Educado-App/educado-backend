const { verify } = require('../helpers/token');
const errorCodes = require('../helpers/errorCodes');

module.exports = (req, res, next) => {
	try {
		const claims = verify(req.headers.token ?? '');
    if(req.params.id != null) {
      if(claims.id !== req.params.id) {
        return res.status(401).send({ error: 'You are not allowed to access this content!' });
      }
    }
		next();
	} catch {
		return res.status(401).send({ 'error': errorCodes['E0001'] });
	}
};