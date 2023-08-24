// Figure out what set of credentials to return...
if (process.env.NODE_ENV === "production") {
  // We are in production. Return the production set of keys
  module.exports = require("./prod");
} else {
  // We are in development. Return the development keys
  module.exports = require("./dev");
}
