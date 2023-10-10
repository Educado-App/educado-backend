const config = require('../config/keys')
const jwt = require('jsonwebtoken')

module.exports = Object.freeze({
    signAccessToken,
    signRefreshToken,
    verify
})

function signAccessToken(payload = {}) {
    return jwt.sign(payload, config.TOKEN_SECRET, { expiresIn: "2h"})
}

function signRefreshToken(payload = {}) {
    return jwt.sign(payload, config.TOKEN_SECRET, { expiresIn: config.REFRESH_TOKEN_MAX_AGE })
}

function verify(token) {
    return jwt.verify(token, config.TOKEN_SECRET)
}