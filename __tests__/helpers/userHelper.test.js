const { UserModel } = require('../../models/Users');
const { StudentModel } = require('../../models/Students');
const { ContentCreatorModel } = require('../../models/ContentCreators');
const { ApplicationModel } = require('../../models/Applications');
const { ProfileModel } = require('../../models/Profile');
const { ProfileEducationModel } = require('../../models/ProfileEducation');
const { ProfileExperienceModel } = require('../../models/ProfileExperience');
const { deleteAccountDataInDB } = require('../../helpers/userHelper');

// Mock models to isolate database interactions during testing
jest.mock('../../models/Users');
jest.mock('../../models/Profile');
jest.mock('../../models/ContentCreators');
jest.mock('../../models/Applications');
jest.mock('../../models/ProfileEducation');
jest.mock('../../models/ProfileExperience');
jest.mock('../../models/Students');

// Test suite
describe('deleteAccountDataInDB', () => {
    const mockId = '1234567890abcdef12345678';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test deleteAccountDataInDB for success
    it('should delete all associated data for a given user ID', async () => {
        // Arrange
        UserModel.findByIdAndDelete.mockResolvedValue(true);
        ProfileModel.findOneAndDelete.mockResolvedValue(true);
        ContentCreatorModel.findOneAndDelete.mockResolvedValue(true);
        ApplicationModel.findOneAndDelete.mockResolvedValue(true);
        ProfileEducationModel.deleteMany.mockResolvedValue(true);
        ProfileExperienceModel.deleteMany.mockResolvedValue(true);
        StudentModel.deleteOne.mockResolvedValue(true);
        
        // Act
        await expect(deleteAccountDataInDB(mockId)).resolves.not.toThrow();

        // Assert
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
        expect(ProfileModel.findOneAndDelete).toHaveBeenCalledWith({ userID: mockId });
        expect(ContentCreatorModel.findOneAndDelete).toHaveBeenCalledWith({ baseUser: mockId });
        expect(ApplicationModel.findOneAndDelete).toHaveBeenCalledWith({ baseUser: mockId });
        expect(ProfileEducationModel.deleteMany).toHaveBeenCalledWith({ userID: mockId });
        expect(ProfileExperienceModel.deleteMany).toHaveBeenCalledWith({ userID: mockId });
        expect(StudentModel.deleteOne).toHaveBeenCalledWith({ baseUser: mockId });
    });

    // Test deleteAccountDataInDB for failure
    it('should throw an error if any deletion operation fails', async () => {
        // Arrange
        UserModel.findByIdAndDelete.mockResolvedValue(true);
        ProfileModel.findOneAndDelete.mockResolvedValue(true);
        ContentCreatorModel.findOneAndDelete.mockRejectedValue(new Error());
        ApplicationModel.findOneAndDelete.mockResolvedValue(true);
        ProfileEducationModel.deleteMany.mockResolvedValue(true);
        ProfileExperienceModel.deleteMany.mockResolvedValue(true);
        StudentModel.deleteOne.mockResolvedValue(true);
        
        // Act
        await expect(deleteAccountDataInDB(mockId)).rejects.toThrow('Failed to delete all account data from database!');

        // Assert
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
        expect(ProfileModel.findOneAndDelete).toHaveBeenCalledWith({ userID: mockId });
        expect(ContentCreatorModel.findOneAndDelete).toHaveBeenCalledWith({ baseUser: mockId });    
    });
});