module.exports = function makeFakeStudentCourse(courseId, sectionId, lectureId, exerciseId) {
  return {
    courseId: courseId,
    totalPoints: 0,
    isComplete: false,
    completionDate: Date.now(),
    sections: [
      {
        sectionId: sectionId,
        totalPoints: 0,
        extraPoints: 0,
        isComplete: false,
        completionDate: Date.now(),
        components: [
          {
            compId: lectureId,
            compType: 'lecture',
            isComplete: false,
            isFirstAttempt: true,
            pointsGiven: 0,
            completionDate: Date.now()
          },
          {
            compId: exerciseId,
            compType: 'exercise',
            isComplete: false,
            isFirstAttempt: true,
            pointsGiven: 0,
            completionDate: Date.now()
          }
        ]
      }
    ]
  };
};