// Helpers
const errorCodes = require('./errorCodes');
const { CustomError } = require('./error');

// Models
const { StudentModel } = require('../models/Students');

// Increment studyStreak if student studied yesterday, else reset it if streak has been broken
async function updateStudyStreak(id) {
	try {
		const { studyStreak, lastStudyDate } = await StudentModel.findById(id).select('studyStreak lastStudyDate');
		const currentDate = new Date();

		const differenceInDays = handleDateDifference(lastStudyDate, currentDate);

		if (differenceInDays === 1) {
			await StudentModel.findByIdAndUpdate(id, { studyStreak: studyStreak + 1, lastStudyDate: currentDate});
			console.log("Study streak incremented!");		// TODO: REMOVE
		}
		else if (differenceInDays > 1) {
			await StudentModel.findByIdAndUpdate(id, { studyStreak: 1, lastStudyDate: currentDate });
			console.log("Study streak reset!");		// TODO: REMOVE
		}
	}
	catch (error) {
		console.error(error.message);	// TODO: suppress in unit test!
		// TODO: update resources documents!
		throw new CustomError(errorCodes.E0019); // 'Failed to update student study streak!'
	}
}

function handleDateDifference(lastStudyDate, currentDate) {
	// Instance check
	if (!(lastStudyDate instanceof Date) || !(currentDate instanceof Date))
		throw new Error('lastStudyDate is not a Date instance!');

	// Validity check
	if (isNaN(lastStudyDate.getTime()) || isNaN(currentDate.getTime()))
		throw new Error('lastStudyDate is not valid!');

	// Get dates without time by setting the time to midnight
	const startDate = new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate());
	const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
	
	// Calculate the difference in milliseconds, and convert it to days
	const differenceInMs = endDate - startDate;

	// E.g., the difference in days between monday 23:59 and tuesday 00:01 is still 1 day
	const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);
	console.log("Difference in days: " + differenceInDays);

	return differenceInDays;
}

// Check if student is on a study streak, and if not, reset the streak (invoked when student logs in)
async function ensureStudyStreakConsistency(id, lastStudyDate) {
	try {    
		const currentDate = new Date();
		const differenceInDays = handleDateDifference(lastStudyDate, currentDate);

		// Reset studyStreak if streak has been broken
		if (differenceInDays > 1) {
			await StudentModel.findByIdAndUpdate(id, { studyStreak: 0 });
			console.log("Study streak reset!");	// TODO: remove
		}
		else {
			console.log("Student is study active!");	// TODO: remove
		}
	}
	catch (error) {
		// TODO: update resources documents!
		throw new CustomError(errorCodes.E0019); // 'Failed to update student study streak!'
	}
}

module.exports = { updateStudyStreak, ensureStudyStreakConsistency };