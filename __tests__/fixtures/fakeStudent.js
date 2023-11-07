module.exports = function makeFakeStudent(userId) {

  return {
    points: 0,
    level: 1,
    subscriptions: [],
    completedCourses: [],
    baseUser: userId
  };
};