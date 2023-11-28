module.exports = function makeFakeStudent(userId) {

  return {
    points: 0,
    currentExtraPoints: 0,
    level: 1,
    subscriptions: [],
    courses: [],
    baseUser: userId
  };
};