// Helpers
const errorCodes = require('./errorCodes');
const { CustomError } = require('./error');

// Models
const { StudentModel } = require('../models/Students');

/**
 * @function updateStudyStreak
 * @description Increments studyStreak and updates lastStudyDate if student also studied yesterday, 
 * 				else soft resets it as the streak has been broken but a new is beginning now.
 * @param {ObjectId} id - The ID of the student.
 * @throws {CustomError} - Throws a custom error (errorCode 'E0807') if the update fails.
 */
async function updateStudyStreak(id) {
	try {
		const { studyStreak, lastStudyDate } = await StudentModel.findById(id).select('studyStreak lastStudyDate');
		const currentDate = new Date();
		const dayDifference = differenceInDays(lastStudyDate, currentDate);
		
		if (dayDifference === 1)
			await StudentModel.findByIdAndUpdate(id, { studyStreak: studyStreak + 1, lastStudyDate: currentDate});
		else if (dayDifference > 1)
			await StudentModel.findByIdAndUpdate(id, { studyStreak: 1, lastStudyDate: currentDate });
	}
	catch (error) {
		console.error(error.message);
		throw new CustomError(errorCodes.E0807); // 'Failed to update student study streak!'
	}
}

// Calculates the full difference between days, ignoring the time of day
// E.g., the difference in days between monday 23:59 and tuesday 00:01 is still 1 day
function differenceInDays(lastStudyDate, currentDate) {
	// Instance check
	if (!(lastStudyDate instanceof Date) || !(currentDate instanceof Date))
		throw new Error('lastStudyDate/currentDate is not a Date instance!');

	// Validity check
	if (isNaN(lastStudyDate.getTime()) || isNaN(currentDate.getTime()))
		throw new Error('lastStudyDate/currentDate is not a valid date!');

	// Get dates without time by setting the time to midnight
	const startDateMidnight = new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate());
	const endDateMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
	
	// Calculate the difference in milliseconds, and convert it to days
	const differenceInMs = endDateMidnight - startDateMidnight;
	const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

	return differenceInDays;
}

// Check if student is on a study streak, and if not, hard reset the streak (invoked when student logs in)
async function ensureStudyStreakConsistency(id, lastStudyDate) {
	try {    
		const currentDate = new Date();
		const dayDifference = differenceInDays(lastStudyDate, currentDate);

		// Reset studyStreak if streak has been broken
		if (dayDifference > 1)
			await StudentModel.findByIdAndUpdate(id, { studyStreak: 0 });
	}
	catch (error) {
		console.error('Failed to ensure study streak consistency!');
	}
}

module.exports = { updateStudyStreak, differenceInDays, ensureStudyStreakConsistency };