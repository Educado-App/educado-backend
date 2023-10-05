const { verify } = require('../helpers/token');

module.exports = (req, res, next) => {
  try {
    const claims = verify(req.headers.token ?? '');
    next();
  } catch {
    // TODO: add updated error messages
    return res.status(401).send({ error: 'You must be logged in!' });
  }
};