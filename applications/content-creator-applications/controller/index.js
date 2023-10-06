const { contentCreatorApplicationList } = require('../data-access');

const makeContentCreatorApplicationController = require('./contentCreatorApplicationController');
const contentCreatorApplicationController = makeContentCreatorApplicationController({ contentCreatorApplicationList });

module.exports = { contentCreatorApplicationController };