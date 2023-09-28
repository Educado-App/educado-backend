const config = require('../config/keys')
const jwt = require('jsonwebtoken')

module.exports = Object.freeze({
    signAccessToken,
    signRefreshToken,
    verify
})

function signAccessToken(payload = {}) {
    return jwt.sign(payload, config.tokenSecret, { expiresIn: config.refreshTokenMaxAge })
}

function signRefreshToken(payload = {}) {
    return jwt.sign(payload, config.tokenSecret, { expiresIn: config.refreshTokenMaxAge })
}

function verify(token) {
    return jwt.verify(token, config.tokenSecret)
}