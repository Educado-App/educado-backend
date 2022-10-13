const Token = require('../helpers/Token')
const Password = require('../helpers/Password')
const { userList } = require('../users')

const buildMakeAuthHandler = require('./authHandler')
const makeAuthEndpointHandler = require('./authEndpointHandler')

const makeAuthHandler = buildMakeAuthHandler({ Password, Token })

const authHandler = makeAuthHandler(userList)
const authEndpointHandler = makeAuthEndpointHandler(authHandler)

module.exports = { authHandler, authEndpointHandler }