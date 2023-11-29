module.exports = function makeUserList(db_model) {
	return Object.freeze({
		add,
		remove,
		findOneByEmail,
		updateEmail,
		updateFirstName,
		updateLastName,
	});

	async function add(user) {
		return await db_model.create(user);
	}

	async function remove(user) {
		const results = await db_model.deleteMany(user);
		return results.deletedCount;
	}

	async function findOneByEmail(email) {
		return await db_model.findOne({ email: email });
	}

	async function updateEmail(email, newEmail) {
		const updatedUser = await db_model.findOneAndUpdate({email: email}, {email: newEmail}, {new: true});
		return updatedUser;
	}

	async function updateFirstName(firstName, newFirstName) {
		const updatedUser = await db_model.findOneAndUpdate({firstName: firstName}, {firstName: newFirstName}, {new: true});
		return updatedUser;
	}

	async function updateLastName(lastName, newLastName) {
		const updatedUser = await db_model.findOneAndUpdate({lastName: lastName}, {lastName: newLastName}, {new: true});
		return updatedUser;
	}

};
