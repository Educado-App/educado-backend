const { ProfileEducationModel } = require('../models/ProfileEducation');
const { ProfileExperienceModel } = require('../models/ProfileExperience');

const errorCodes = require('./errorCodes');
const { CustomError } = require('./error');
/**
 * Creates database entries for academic and work experience forms from approved content creator application.
 *
 * @param {Object} application - The application object containing data from the filled out application forms.
 */
async function storeEducationAndExperienceFormsInDB(application) {
	try {
		// Extract education form data
		const educationData = application.academicLevel.map((_, index) => ({
			userID: application.baseUser,
			educationLevel: application.academicLevel[index],
			status: application.academicStatus[index],
			course: application.major[index],
			institution: application.institution[index],
			startDate: application.educationStartDate[index],
			endDate: application.educationEndDate[index],
		}));

		// Extract work experience form data
		const workExperienceData = application.company.map((_, index) => ({
			userID: application.baseUser,
			company: application.company[index],
			jobTitle: application.position[index],
			startDate: application.workStartDate[index],
			endDate: application.workEndDate[index],
			isCurrentJob: application.isCurrentJob[index],
			description: application.workActivities[index],
		}));

		// Create entries in DB from forms in approved application
		await ProfileEducationModel.insertMany(educationData);
		await ProfileExperienceModel.insertMany(workExperienceData);
	} 
	catch (error) {
		console.error('Failed creating entries in database from forms in approved content creator application: ' +  error);
		throw new CustomError(errorCodes.E1007);
	}
}

module.exports = { storeEducationAndExperienceFormsInDB };