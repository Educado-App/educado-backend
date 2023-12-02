const Id = require('../../../helpers/Id');

const buildMakeContentCreatorApplication = require('./contentCreatorApplication');
const makeContentCreatorApplication = buildMakeContentCreatorApplication({ Id });

module.exports = { makeContentCreatorApplication };