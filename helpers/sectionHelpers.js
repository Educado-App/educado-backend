function getLatestComponentFromSection(section) {
	return section.components[section.components.length - 1];
}

module.exports = Object.freeze({
	getLatestComponentFromSection
});