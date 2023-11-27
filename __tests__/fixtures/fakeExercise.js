module.exports = function makeFakeExercise() {
    return {
        _id: '5e8b7e4d7f8e4d4c7f8e4d4c',
        title: 'Sample Exercise',
        question: 'This is a sample exercise for testing purposes.',
        answers: [{text: "Sample answer", correct: false}],
        parentSection: '', // Replace this with an actual section ID from your database
        dateCreated: new Date(),
        dateUpdated: new Date(),
    };
};
