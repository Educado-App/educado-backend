const { StudentModel } = require('../models/Students');

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
      { $project: { name: 1, points: 1, profilePhoto: 1 } }
    ]);

    return students.map((student, index) => ({
      rank: index + 1,
      name: student.name,
      score: student.points,
      image: student.profilePhoto ? `${process.env.TRANSCODER_SERVICE_URL}/bucket/${student.profilePhoto}` : null
    }));
  } catch (error) {
    throw new Error('Error fetching leaderboard data');
  }
};

module.exports = { getLeaderboard };
