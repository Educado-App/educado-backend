const { StudentModel } = require('../models/Students');
const { UserModel } = require('../models/Users');

const getLeaderboard = async (timeInterval) => {
  try {
    // Adjust the aggregation pipeline based on the time interval
    const matchStage = {};
    if (timeInterval !== 'all') {
      const now = new Date();
      let startDate;
      switch (timeInterval) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      matchStage.createdAt = { $gte: startDate };
    }

    const students = await StudentModel.aggregate([
      { $match: matchStage },
      { $sort: { points: -1 } },
      { $limit: 100 },
      { $project: { baseUser: 1, points: 1 } }
    ]);

    const userDetailsPromises = students.map(async (student, index) => {
      try {
        const user = await UserModel.findById(student.baseUser).select('firstName lastName profilePhoto');
        if (!user) {
          console.warn(`User with ID ${student.baseUser} not found`);
          return null;
        }
        return {
          rank: index + 1,
          name: `${user.firstName} ${user.lastName}`,
          score: student.points,
          image: user.profilePhoto ? `${process.env.TRANSCODER_SERVICE_URL}/bucket/${user.profilePhoto}` : null
        };
      } catch (error) {
        console.error(`Error fetching user details for student with baseUser ID ${student.baseUser}:`, error);
        return null;
      }
    });

    const userDetails = await Promise.all(userDetailsPromises);
    return userDetails.filter(detail => detail !== null);
  } catch (error) {
    throw new Error('Error fetching leaderboard data: ' + error.message);
  }
};

module.exports = { getLeaderboard };
