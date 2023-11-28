/**
 * Adds a context object to incomming request
 */

const addUserContext = require('./user');

module.exports = function context(req, res, next) {
    
  const context = {};

  /*   Append context adders here ...    */
  context.user = addUserContext(req, context);

  req.context = context;

  next();

};