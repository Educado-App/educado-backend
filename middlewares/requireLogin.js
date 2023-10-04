const { verify } = require("../helpers/token");

module.exports = (req, res, next) => {
  if (!verify(req.headers.token)) {
    return res.status(401).send({ error: "You must be logged in!" });
  }

  next();
};