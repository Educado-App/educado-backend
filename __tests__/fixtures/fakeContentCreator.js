const mongoose = require('mongoose');

module.exports = function makeFakeContentCreator(baseUserId, approved, rejected) {
    return {
        //Created like this as to easily dictate their values for the purpose of the individual tests
        approved: approved,
        rejected: rejected,
        baseUser: baseUserId,
    }
}
