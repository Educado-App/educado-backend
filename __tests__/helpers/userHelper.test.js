/**
 * @file userHelper.test.js
 * @description Test suite for userHelper.js, simulating database interactions without actually connecting to database.
 */

// Helpers
const mongoose = require('mongoose');
const { handleAccountDeletion, handleSubscriptions, deleteDatabaseEntries } = require('../../helpers/userHelper');

// Models
const { UserModel } = require('../../models/Users');
const { StudentModel } = require('../../models/Students');
const { ContentCreatorModel } = require('../../models/ContentCreators');
const { CourseModel } = require('../../models/Courses');
const { ApplicationModel } = require('../../models/Applications');
const { ProfileModel } = require('../../models/Profile');
const { ProfileEducationModel } = require('../../models/ProfileEducation');
const { ProfileExperienceModel } = require('../../models/ProfileExperience');

// Mock mongoose and models to isolate database interactions during testing
jest.mock('mongoose');
jest.mock('../../models/Users', () => ({ UserModel: { deleteOne: jest.fn() } }));
jest.mock('../../models/Profile', () => ({ ProfileModel: { deleteOne: jest.fn() } }));
jest.mock('../../models/ContentCreators', () => ({ ContentCreatorModel: { deleteOne: jest.fn() } }));
jest.mock('../../models/Applications', () => ({ ApplicationModel: { deleteOne: jest.fn() } }));
jest.mock('../../models/ProfileEducation', () => ({ ProfileEducationModel: { deleteMany: jest.fn() } }));
jest.mock('../../models/ProfileExperience', () => ({ ProfileExperienceModel: { deleteMany: jest.fn() } }));
jest.mock('../../models/Students', () => ({ StudentModel: { findOne: jest.fn(), deleteOne: jest.fn() } }));
jest.mock('../../models/Courses', () => ({ CourseModel: { updateOne: jest.fn() } }));

// Test suite
describe('userHelper', () => {
    let mockSession, originalConsoleError;
    const mockId = '1234567890abcdef12345678';
    const mockCourseId_1 = '6734acc78e0307256e657aa7';
    const mockCourseId_2 = '6733597286cbe52f37d1b982';
    const mockCourseId_3 = '673347fcf81b271895d46efe';

    beforeEach(() => {
        mockSession = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongoose.startSession.mockResolvedValue(mockSession);

        // Suppress console.error during tests by mocking it
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
        console.error = originalConsoleError; // Restore console.error
    });

    describe('handleAccountDeletion', () => {
        it('should delete all account data, handle subscriptions and commit transaction', async () => {
            UserModel.deleteOne.mockResolvedValue(true);
            ProfileModel.deleteOne.mockResolvedValue(true);
            ContentCreatorModel.deleteOne.mockResolvedValue(true);
            ApplicationModel.deleteOne.mockResolvedValue(true);
            ProfileEducationModel.deleteMany.mockResolvedValue(true);
            ProfileExperienceModel.deleteMany.mockResolvedValue(true);
            StudentModel.deleteOne.mockResolvedValue(true);
            StudentModel.findOne.mockResolvedValue({ subscriptions: [mockCourseId_1, mockCourseId_2, mockCourseId_3] });
            CourseModel.updateOne.mockResolvedValue(true);

            await handleAccountDeletion(mockId);

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(UserModel.deleteOne).toHaveBeenCalledWith({ _id: mockId }, { session: mockSession });
            expect(ProfileModel.deleteOne).toHaveBeenCalledWith({ userID: mockId }, { session: mockSession });
            expect(ContentCreatorModel.deleteOne).toHaveBeenCalledWith({ baseUser: mockId }, { session: mockSession });
            expect(ApplicationModel.deleteOne).toHaveBeenCalledWith({ baseUser: mockId }, { session: mockSession });
            expect(ProfileEducationModel.deleteMany).toHaveBeenCalledWith({ userID: mockId }, { session: mockSession });
            expect(ProfileExperienceModel.deleteMany).toHaveBeenCalledWith({ userID: mockId }, { session: mockSession });
            expect(StudentModel.deleteOne).toHaveBeenCalledWith({ baseUser: mockId }, { session: mockSession });
            expect(StudentModel.findOne).toHaveBeenCalledWith({ baseUser: mockId });
            expect(CourseModel.updateOne).toHaveBeenCalledWith({ _id: mockCourseId_1 }, { $inc: { numOfSubscriptions: -1 } }, { session: mockSession });
            expect(CourseModel.updateOne).toHaveBeenCalledWith({ _id: mockCourseId_2 }, { $inc: { numOfSubscriptions: -1 } }, { session: mockSession });
            expect(CourseModel.updateOne).toHaveBeenCalledWith({ _id: mockCourseId_3 }, { $inc: { numOfSubscriptions: -1 } }, { session: mockSession });
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should abort the database transaction if an error occurs', async () => {
            UserModel.deleteOne.mockRejectedValue(new Error());

            await expect(handleAccountDeletion(mockId)).rejects.toThrow('Failed to delete all account data from database!');

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });
    });

    describe('handleSubscriptions', () => {
        it('should decrement numOfSubscriptions for each subscribed course', async () => {
            StudentModel.findOne.mockResolvedValue({ subscriptions: [mockCourseId_1, mockCourseId_2, mockCourseId_3] });
            CourseModel.updateOne.mockResolvedValue(true);

            await handleSubscriptions(mockId, mockSession);

            expect(StudentModel.findOne).toHaveBeenCalledWith({ baseUser: mockId });
            expect(CourseModel.updateOne).toHaveBeenCalledWith({ _id: mockCourseId_1 }, { $inc: { numOfSubscriptions: -1 } }, { session: mockSession });
            expect(CourseModel.updateOne).toHaveBeenCalledWith({ _id: mockCourseId_2 }, { $inc: { numOfSubscriptions: -1 } }, { session: mockSession });
            expect(CourseModel.updateOne).toHaveBeenCalledWith({ _id: mockCourseId_3 }, { $inc: { numOfSubscriptions: -1 } }, { session: mockSession });
        });
    }); 

    describe('deleteDatabaseEntries', () => {
        it('should delete all database entries', async () => {
            UserModel.deleteOne.mockResolvedValue(true);
            ProfileModel.deleteOne.mockResolvedValue(true);
            ContentCreatorModel.deleteOne.mockResolvedValue(true);
            ApplicationModel.deleteOne.mockResolvedValue(true);
            ProfileEducationModel.deleteMany.mockResolvedValue(true);
            ProfileExperienceModel.deleteMany.mockResolvedValue(true);
            StudentModel.deleteOne.mockResolvedValue(true);

            await deleteDatabaseEntries(mockId, mockSession);

            expect(UserModel.deleteOne).toHaveBeenCalledWith({ _id: mockId }, { session: mockSession });
            expect(ProfileModel.deleteOne).toHaveBeenCalledWith({ userID: mockId }, { session: mockSession });
            expect(ContentCreatorModel.deleteOne).toHaveBeenCalledWith({ baseUser: mockId }, { session: mockSession });
            expect(ApplicationModel.deleteOne).toHaveBeenCalledWith({ baseUser: mockId }, { session: mockSession });
            expect(ProfileEducationModel.deleteMany).toHaveBeenCalledWith({ userID: mockId }, { session: mockSession });
            expect(ProfileExperienceModel.deleteMany).toHaveBeenCalledWith({ userID: mockId }, { session: mockSession });
            expect(StudentModel.deleteOne).toHaveBeenCalledWith({ baseUser: mockId }, { session: mockSession });
        });
    });
});