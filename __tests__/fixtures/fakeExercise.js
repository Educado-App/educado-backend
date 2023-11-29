module.exports = function makeFakeExercise() {
  return {
    title: 'Sample Exercise',
    question: 'This is a sample exercise for testing purposes.',
    answers: [{text: 'Sample answer', correct: false}],
    parentSection: '', // Replace this with an actual section ID from your database
    dateCreated: new Date(),
    dateUpdated: new Date(),
  };
};
