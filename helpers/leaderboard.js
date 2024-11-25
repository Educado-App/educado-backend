const { StudentModel } = require('../models/Students');

const getLeaderboard = async () => {
	try {
		const students = await StudentModel.find().sort({ points: -1 }).limit(100).select('name points profilePhoto');
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
