const { StudentModel } = require('../models/Students');
const { UserModel } = require('../models/Users');

const getLeaderboard = async (timeInterval, userId) => {
	try {
		const matchStage = getMatchStage(timeInterval);
		const students = await fetchStudents(matchStage);
		const userDetails = await fetchUserDetails(students);

		const currentUserRank = assignRanks(userDetails, userId);
		const leaderboard = getFinalLeaderboard(userDetails, currentUserRank);

		return { leaderboard, currentUserRank };
	} catch (error) {
		throw new Error('Error fetching leaderboard data: ' + error.message);
	}
};

const getMatchStage = (timeInterval) => {
	if (timeInterval === 'all') return {};

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
	case 'everyMonth':
		startDate = new Date(now.getFullYear(), now.getMonth(), 1);
		break;
	}
	return { createdAt: { $gte: startDate } };
};

const fetchStudents = async (matchStage) => {
	return await StudentModel.aggregate([
		{ $match: matchStage },
		{ $sort: { points: -1 } },
		{ $limit: 100 },
		{ $project: { baseUser: 1, points: 1 } },
	]);
};

const fetchUserDetails = async (students) => {
	const userDetailsPromises = students.map(async (student) => {
		try {
			const user = await UserModel.findById(student.baseUser).select(
				'firstName lastName profilePhoto'
			);
			if (!user) {
				return null;
			}
			return {
				name: `${user.firstName} ${user.lastName}`,
				score: student.points,
				image: user.profilePhoto
					? `${process.env.TRANSCODER_SERVICE_URL}/bucket/${user.profilePhoto}`
					: null,
				baseUser: student.baseUser,
			};
		} catch (error) {
			console.error(
				`Error fetching user details for student with baseUser ID ${student.baseUser}:`,
				error
			);
			return null;
		}
	});

	let userDetails = await Promise.all(userDetailsPromises);
	return userDetails.filter((detail) => detail !== null);
};

const assignRanks = (userDetails, userId) => {
	userDetails.forEach((detail, index) => {
		detail.rank = index + 1;
	});
	const currentUser = userDetails.find(
		(user) => user.baseUser.toString() === userId.toString()
	);
	return currentUser ? currentUser.rank : null;
};

const getFinalLeaderboard = (userDetails, currentUserRank) => {
	const TotalUsers = 30; // Total users to fetch the leaderboard
	if (currentUserRank <= 30) {
		return userDetails.slice(0, 30);
	} else {
		const topTenUsers = userDetails.slice(0, 10);
		const currentUserIndex = userDetails.findIndex(
			(user) => user.rank === currentUserRank
		);
		const adjacentUsers = userDetails.slice(
			Math.max(currentUserIndex - 1, 0),
			Math.min(currentUserIndex + 2, userDetails.length)
		);

		// Remove duplicates
		const uniqueUsers = [...new Map([...topTenUsers, ...adjacentUsers].map(user => [user.baseUser, user])).values()];

		return uniqueUsers.slice(0, TotalUsers);
	}
};

module.exports = { getLeaderboard };
