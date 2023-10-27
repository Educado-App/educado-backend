module.exports = function makeFakeCourse() {

  return {
    sections: [],
    title: 'test course',
    category: 'test',
    difficulty: 1,
    hours: 10,
    description: "This course is a test course",
    dateCreated: new Date(),
    dateUpdated: new Date(),
    numOfSubscriptions: 0,
  };
};
