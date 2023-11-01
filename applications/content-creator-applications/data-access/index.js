const { ContentCreatorApplication } = require('../../../models/ContentCreator');
const Params = require('../../../helpers/ajv/params');
const ParamsSchema = require('../../../helpers/ajv/paramsSchema');

const makeContentCreatorApplicationList = require('./contentCreatorApplicationList');
const contentCreatorApplicationList = makeContentCreatorApplicationList({ dbModel: ContentCreatorApplication, Params, ParamsSchema });

module.exports = { contentCreatorApplicationList };
