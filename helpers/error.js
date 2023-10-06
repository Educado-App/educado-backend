function makeHttpError({ status = 500, message }) {

    return {
        success: false,
        status,
        errors: message
    }
}

/**
 * Allows for an object to be passed as a message
 */
class MultipleError extends Error {

    constructor(message = {}) {
        super()
        super.message = message
    }
}

module.exports = { makeHttpError, MultipleError }