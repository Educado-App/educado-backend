module.exports = function makeFakeLecture() {

    return {
        parentSection: '',
        title: 'test lecture',
        description: 'test description',
        dateCreated: Date.now(),
        dateUpdated: Date.now()
    };
};