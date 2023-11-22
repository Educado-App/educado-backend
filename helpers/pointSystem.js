const { StudentModel } = require('../models/Students');
const errorCodes = require('../helpers/errorCodes');

async function giveExtraPointsForSection(section, student, extraPoints) {
  const completedCourseIndex = student.completedCourses.findIndex(completedCourse => completedCourse.courseId.equals(section.parentCourse));

  let sectionExists;

  if (completedCourseIndex === -1) {
    throw errorCodes['E0903'];
  }

  // Looks for the section in completedCourses
  student.completedCourses[completedCourseIndex].completedSections.forEach((completedSection) => {
    if (completedSection.sectionId.equals(section._id)) {
      sectionExists = true;
    }
  });

  if (!sectionExists) {
    throw errorCodes['E0902'];
  }

  // Update the extraPoints field for the section
  await updateExtraPointsForSection(section, student, extraPoints, completedCourseIndex);

  // Update student points and level
  await updateStudentLevel(student.baseUser, extraPoints, student.level);

  return await StudentModel.findOne({ baseUser: student.baseUser });
}

async function updateExtraPointsForSection(section, student, extraPoints, completedCourseIndex) {
    // Updates the extraPoints field for the completedSection and completedCourse
    await StudentModel.findOneAndUpdate(
      { baseUser: student.baseUser },
      {
        $inc: {
          [`completedCourses.${completedCourseIndex}.completedSections.$[sectionId].extraPoints`]: extraPoints,
          [`completedCourses.${completedCourseIndex}.completedSections.$[sectionId].totalPoints`]: extraPoints
        }
      },
      {
        arrayFilters: [{ 'sectionId.sectionId': section._id }]
      }
    )

    await updateCompletedCoursesTotalPoints(student.baseUser, section.parentCourse, completedCourseIndex);
}

// Update student points and level based on earned points
async function updateStudentLevel(userId, points, level) {
    // Check if user has enough points to level up
    const pointsToNextLevel = level * 100; // For example, 100 points * level to reach the next level
    if (points >= pointsToNextLevel) {
    // User has enough points to level up
    points -= pointsToNextLevel; // Deduct points needed for the level up
    level++;
    }

    // Update user points and level in the database
    await StudentModel.findOneAndUpdate(
    { baseUser: userId },
    { $inc: { points: points }, $set: { level: level } },
    { new: true } // Set to true if you want to get the updated document as a result
    );
}

async function updateCompletedSectionsTotalPoints(userId, sectionId, completedCourseIndex) {
  // Calculate the totalPoints for the updated section
  const updatedStudent = await StudentModel.findOne({ baseUser: userId });
  const completedCourse = updatedStudent.completedCourses[completedCourseIndex];
  const updatedSection = completedCourse.completedSections.find(completedSection => completedSection.sectionId.equals(sectionId))

  updatedSection.totalPoints = updatedSection.completedExercises.reduce((total, exercise) => total + exercise.pointsGiven, 0);
  updatedSection.totalPoints += updatedSection.extraPoints;

  // Update the user's totalPoints
  await StudentModel.findOneAndUpdate(
    { baseUser: userId },
    {
      $set: {
        [`completedCourses.${completedCourseIndex}.completedSections.$[section].totalPoints`]: updatedSection.totalPoints
      }
    },
    {
      arrayFilters: [{ 'section.sectionId': sectionId }]
    }
  );

}

async function updateCompletedCoursesTotalPoints(userId, courseId, completedCourseIndex) {
  // Calculate and update totalPoints for the completedCourse
  const updatedStudent = await StudentModel.findOne({ baseUser: userId });
  const completedCourse = updatedStudent.completedCourses[completedCourseIndex];

  const totalPoints = completedCourse.completedSections.reduce((sum, completedSection) => {
      return sum + completedSection.totalPoints;
  }, 0);

  await StudentModel.findOneAndUpdate(
      { baseUser: userId, 'completedCourses.courseId': courseId },
      {
          $set: {
              'completedCourses.$.totalPoints': totalPoints
          }
      }
  );
}

module.exports = {
    updateStudentLevel,
    giveExtraPointsForSection,
    updateCompletedCoursesTotalPoints,
    updateCompletedSectionsTotalPoints,
};