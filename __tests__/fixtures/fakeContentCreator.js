const mongoose = require('mongoose');

module.exports = function makeFakeContentCreator(baseUserId) {
    return {
        approved: false,
        rejected: false,
        baseUser: baseUserId,
    }
}
