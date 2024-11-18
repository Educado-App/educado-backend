// Helpers
const mongoose = require('mongoose');
const errorCodes = require('./errorCodes');
const { CustomError } = require('./error');

// Models
const { UserModel } = require('../models/Users');
const { StudentModel } = require('../models/Students');
const { CourseModel } = require('../models/Courses');
const { ContentCreatorModel } = require('../models/ContentCreators');
const { ApplicationModel } = require('../models/Applications');
const { ProfileModel } = require('../models/Profile');
const { ProfileEducationModel } = require('../models/ProfileEducation');
const { ProfileExperienceModel } = require('../models/ProfileExperience');

/**
 * Handles deletion of all account data associated with a given user ID from the database:
 * - User
 * - Profile
 * - Content Creator
 * - Student
 * - Application
 * - Educations (academic)
 * - Experiences (professional)
 * 
 * And decrements the numOfSubscriptions attribute for each course the student is subscribed to.
 *
 * @param {string} id - The ID of the user whose account data is to be deleted.
 * @throws {CustomError} Throws errorCode E0018 if deletion fails.
 */
async function handleAccountDeletion(id) {
	const session = await mongoose.startSession();
	
	try {
		session.startTransaction();

		await handleSubscriptions(id, session);
		await deleteDatabaseEntries(id, session);
		
		await session.commitTransaction();
	}
	catch(error) {
		// Cancel database operations
		await session.abortTransaction();	
		throw new CustomError(errorCodes.E0018); // 'Failed to delete all account data from database!'
	}
	finally {
		await session.endSession();
	}
}

// Decrement numOfSubscriptions attribute for each subscribed course
async function handleSubscriptions(id, session) {
	const student = await StudentModel.findOne({ baseUser: id });
	const courseIdArray = student ? student.subscriptions : [];
	
	if (courseIdArray?.length > 0) {
		for (const courseId of courseIdArray) {
			await CourseModel.updateOne(
				{ _id: courseId },
				{ $inc: { numOfSubscriptions: -1 } }, // Decrement by 1
				{ session }
			);
		}
	}
}

async function deleteDatabaseEntries(id, session) {
	await UserModel.deleteOne({ _id: id }, { session });
	await ProfileModel.deleteOne({ userID: id }, { session });
	await ContentCreatorModel.deleteOne({ baseUser: id }, { session });
	await ApplicationModel.deleteOne({ baseUser: id }, { session });
	await ProfileEducationModel.deleteMany({ userID: id }, { session });
	await ProfileExperienceModel.deleteMany({ userID: id }, { session });
	await StudentModel.deleteOne({ baseUser: id }, { session });
}

module.exports = { handleAccountDeletion, handleSubscriptions, deleteDatabaseEntries };