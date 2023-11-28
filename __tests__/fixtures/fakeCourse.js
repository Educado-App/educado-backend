module.exports = function makeFakeCourse() {

  return {
    title: 'test course',
    description: 'test course description',
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    category: 'sewing',
    published: false,
    sections: [],
    difficulty: 1,
    estimatedHours: 1,
    rating: 5,
    numOfSubscriptions: 0,
  };
};
