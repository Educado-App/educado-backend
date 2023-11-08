const { encrypt } = require('../../helpers/password');
const mongoose = require('mongoose');

module.exports = function makeFakeContentCreator(baseUserId = mongoose.Types.ObjectId()) {
    return {
        baseUser: baseUserId,
    }
}
