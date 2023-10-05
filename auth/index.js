const Password = require('../helpers/password')
const { userList } = require('../users')
const Token = require('../helpers/token')

const buildMakeAuthHandler = require('./authHandler')
const makeAuthEndpointHandler = require('./authController')

const makeAuthHandler = buildMakeAuthHandler({ Password, Token })

const authHandler = makeAuthHandler(userList)
const authEndpointHandler = makeAuthEndpointHandler(authHandler)

module.exports = { authHandler, authEndpointHandler }