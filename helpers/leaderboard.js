const { StudentModel } = require('../models/Students');
const errorCodes = require('../helpers/errorCodes');

async function findTop100Students(timeInterval) {
    let dateFilter = getDateFilter(timeInterval);
    
    // Fetch the top 100 students based on points from completed exercises in the current month
    const leaderboard = await StudentModel.aggregate([
        {
            $match: {
                'completedCourses.completedSections.completedExercises.completionDate': dateFilter
            }
        },
        {
            $unwind: '$completedCourses'
        },
        {
            $unwind: '$completedCourses.completedSections'
        },
        {
            $unwind: '$completedCourses.completedSections.completedExercises'
        },
        {
            $lookup: {
            from: 'users',
            localField: 'baseUser',
            foreignField: '_id',
            as: 'user'
            }
        },
        {
            $unwind: '$user' // Unwind the result of $lookup so the first and last name is not an array
        },
        {
            $project: {
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            points: 1,
            level: 1,
            completedExercisesPoints: '$completedCourses.completedSections.completedExercises.pointsGiven'
            }
        },
        // Ensures the correct structure of the fields
        {
            $group: {
            _id: '$_id',
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            points: { $first: '$points' },
            level: { $first: '$level' },
            completedExercisesPoints: { $sum: '$completedExercisesPoints' }
            }
        },
        {
            $sort: {
            completedExercisesPoints: -1
            }
        },
        {
            $limit: 100
        }
    ]);
    
    return leaderboard;
}

function getDateFilter(timeInterval) {
    // Get the current date
    const currentDate = new Date();

    switch (timeInterval) {
        case 'day':
            dateFilter = {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 0, 0, 0)
            };
            break;
        case 'week':
            // Assuming a week starts on Monday
            const firstDayOfWeek = currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1);
            dateFilter = {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfWeek, 0, 0, 0),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfWeek + 7, 0, 0, 0)
            };
            break;                
        case 'month':
            dateFilter = {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 0, 0, 0)
            };
            break;
        case 'all':
            dateFilter = {
                $lt: new Date()
            };
            break;
        default:
            throw errorCodes['E0015'];
    }

    return dateFilter;
}

module.exports = {
    findTop100Students
};