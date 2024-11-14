// Models
const { UserModel } = require('../models/Users');
const { StudentModel } = require('../models/Students');
const { CourseModel } = require('../models/Courses');
const { ContentCreatorModel } = require('../models/ContentCreators');
const { ApplicationModel } = require('../models/Applications');
const { ProfileModel } = require('../models/Profile');
const { ProfileEducationModel } = require('../models/ProfileEducation');
const { ProfileExperienceModel } = require('../models/ProfileExperience');

// Helpers
const errorCodes = require('./errorCodes');
const { CustomError } = require('./error');

async function deleteAccountDataInDB(id) {
	try {
		// Delete database entries
		await UserModel.findByIdAndDelete(id);							// User
		await ProfileModel.findOneAndDelete({ userID: id }); 			// Profile
		await ContentCreatorModel.findOneAndDelete({ baseUser: id });	// Content creator
		await ApplicationModel.findOneAndDelete({ baseUser: id });		// Application
		await ProfileEducationModel.deleteMany({ userID: id });			// Academic experience forms
		await ProfileExperienceModel.deleteMany({ userID: id });		// Work experience forms 
		
		// Fetch student
		const student = await StudentModel.findOne({ baseUser: id });
		
		// Fetch all ids for each course the student is subscribed to
		const courseIdArray = student ? student.subscriptions : [];

		// Decrement numOfSubscriptions attribute for each subscribed course
		if (courseIdArray.length > 0) {
			courseIdArray.forEach(async (courseId) => {
				await CourseModel.updateOne(
					{ _id: courseId },
					{ $inc: { numOfSubscriptions: -1 } } // Decrement 1
				);
			});
		}
		
		// Finally delete student entry in database
		await StudentModel.deleteOne({ baseUser: id });
	}
	catch(error) {
		throw new CustomError(errorCodes.E0018);    // 'Failed to delete all account data from database!'
	}
}

module.exports = { deleteAccountDataInDB };