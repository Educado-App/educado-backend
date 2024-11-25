// Helpers
const mongoose = require('mongoose');
const errorCodes = require('./errorCodes');
const { CustomError } = require('./error');

// Models
const { StudentModel } = require('../models/Students');

async function updateStudyStreak(id) {
	const session = await mongoose.startSession();
	
	try {
		session.startTransaction();

		const currentStudyStreak = await StudentModel.findOne({ baseUser: id }).select('studyStreak');
		const lastStudyDate = await StudentModel.findOne({ baseUser: id }).select('lastStudyDate');
		const currentDate = new Date();

		const differenceInDays = handleDateDifference(lastStudyDate, currentDate);

		if (differenceInDays === 1)
			await StudentModel.updateOne({ baseUser: id }, { studyStreak: currentStudyStreak + 1 }, { session });
		else if (differenceInDays > 1)
			await StudentModel.updateOne({ baseUser: id }, { studyStreak: 1 }, { session });

		// Update last study date
		await StudentModel.updateOne({ baseUser: id }, { lastStudyDate: currentDate }, { session });

		await session.commitTransaction();
	}
	catch (error) {
		// Cancel database operations in case of failure
		await session.abortTransaction();

		// TODO: update resources documents!
		throw new CustomError(errorCodes.E0019); // 'Failed to update student study streak!'
	}
	finally {
		await session.endSession();
	}
}

function handleDateDifference(lastStudyDate, currentDate) {
    
	// Check if the provided values are instances of the Date object
	if (!(lastStudyDate instanceof Date) || !(currentDate instanceof Date))
		throw new Error('Invalid date(s) provided.');

	// Check if the dates are valid
	if (isNaN(lastStudyDate.getTime()) || isNaN(currentDate.getTime()))
		throw new Error('Invalid date(s) provided.');

	// Get dates without time, by setting the time to midnight
	const startDate = new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate());
	const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

	// Calculate the difference in milliseconds, and convert it to days
	const differenceInMs = endDate - startDate;
	const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

	return differenceInDays;
}

// Check if student is on a study streak, and if not, reset the streak
async function ensureStudyStreak(id) {
	try {    
		const lastStudyDate = await StudentModel.findOne({ baseUser: id }).select('lastStudyDate');
		const currentDate = new Date();

		const differenceInDays = handleDateDifference(lastStudyDate, currentDate);

		if (differenceInDays > 1)
			await StudentModel.updateOne({ baseUser: id }, { studyStreak: 0 });
	}
	catch (error) {
		// TODO: update resources documents!
		throw new CustomError(errorCodes.E0019); // 'Failed to update student study streak!'
	}
}

module.exports = { updateStudyStreak, ensureStudyStreak };