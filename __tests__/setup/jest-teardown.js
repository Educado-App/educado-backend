/**
 * Closes the connection when not in watch mode
 */
module.exports = async function ({ watch, watchAll } = {}) {
    if (!watch && !watchAll) {
        await global.__MONGOD__.stop()
    }
}