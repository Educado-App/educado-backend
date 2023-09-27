const email = require("../helpers/email");

module.exports = function makeUserList(db_model) {
    return Object.freeze({
        add,
        remove,
        findOneByEmail,
        findOneById,
        updateEmail,
        updateName,
    });

    async function findOneById(id) {
        return await db_model.findById(id);
    }

    async function add(user) {
        return await db_model.create(user);
    }

    async function remove(user = {}) {
        const results = await db_model.deleteMany(user);
        return results.deletedCount;
    }

    async function findOneByEmail(email) {
        return await db_model.findOne({ email: email });
    }

    async function updateEmail(email, newEmail) {
        const updatedUser = await db_model.findOneAndUpdate({email: email}, {email: newEmail}, {new: true})
        return updatedUser;
    }

    async function updateName(name, newName) {
        const updatedUser = await db_model.findOneAndUpdate({name: name}, {name: newName}, {new: true})
        return updatedUser;
    }
    
};
