module.exports = function makeFakeSection() {

    return {
        lectures: [],
        exercises: [],
        title: 'test section',
        description: 'this is a test section',
        sectionNumber: 1,
        dateCreated: Date.now(),
        dateUpdated: Date.now(),
        totalPoints: 100,
        extraPoints: 0,
        components: [],
        parentCourse: '',
    };
};