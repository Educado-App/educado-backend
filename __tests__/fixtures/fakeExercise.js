module.exports = function makeFakeExercise() {
    return {
        title: 'Sample Exercise',
        description: 'This is a sample exercise for testing purposes.',
        instructions: 'Follow the instructions carefully.',
        parentSection: '', // Replace this with an actual section ID from your database
        createdAt: new Date(),
        modifiedAt: new Date(),
    };
};
