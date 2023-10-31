module.exports = function makeFakeSection() {

    return {
        lectures: [],
        exercises: [],
        title: 'test section',
        description: 'this is a test section',
        sectionNumber: 1,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        totalPoints: 100,
        components: [],
        parentCourse: '',
    };
};