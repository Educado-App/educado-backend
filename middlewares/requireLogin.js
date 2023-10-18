const { verify } = require('../helpers/token');
const { UserModel } = require('../models/Users');
const errorCodes = require('../helpers/errorCodes');
const isValidId = require('../helpers/Id');

module.exports = async (req, res, next) => {

  let claims;
  try {
    claims = verify(req.headers.token);
  } catch {
    return res.status(401).send({ error: errorCodes['E0001'] });
  }

  if (req.params.id) {
    if (claims.id !== req.params.id || !claims.id) {
      return res.status(401).send({ error: errorCodes['E0002'] });
    }
  }

  next();
}