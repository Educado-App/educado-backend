/**
*   Sets up a connection to an in-memory mongo database for fast and isolated testing
*/

const { MongoMemoryServer } = require('mongodb-memory-server')
const path = require('path')
const fs = require('fs')

const globalConfigPath = path.join(__dirname, 'globalConfigMongo.json')

const mongod =
    global.__MONGOD__ ||
    new MongoMemoryServer({
        autoStart: false,
        useUnifiedTopology: true
    })

module.exports = async () => {
    await mongod.ensureInstance()
    
    const mongoConfig = {
        mongoDBName: 'jest',
        mongoUri: mongod.getUri()
    }

    // Write global config to disk because all tests run in different contexts.
    fs.writeFileSync(globalConfigPath, JSON.stringify(mongoConfig))

    // Set reference to mongod in order to close the server during teardown.
    global.__MONGOD__ = mongod
}