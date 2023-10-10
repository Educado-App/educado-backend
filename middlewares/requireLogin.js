const { verify } = require('../helpers/token');

module.exports = (req, res, next) => {
  console.log("Params: ", req.params);
	try {
		const claims = verify(req.headers.token ?? '');
    if(req.params.id != null) {
      if(claims.id !== req.params.id) {
        return res.status(401).send({ error: 'You are not allowed to access this content!' });
      }
    }
		next();
	} catch {
		// TODO: add updated error messages
		return res.status(401).send({ error: 'You must be logged in!' });
	}
};