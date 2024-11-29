const mongoose = require('mongoose');
const { updateStudyStreak, ensureStudyStreakConsistency } = require('../../helpers/studentHelper');
const { StudentModel } = require('../../models/Students');
const { CustomError } = require('../../helpers/error');
const errorCodes = require('../../helpers/errorCodes');

jest.mock('../../models/Students');

describe('studentHelper', () => {
    const mockId = '1234567890abcdef12345678';
    const today = new Date();
    let lastStudyDate;
    let originalConsoleError;
    
    beforeEach(() => {
        lastStudyDate = new Date();

        // Suppress console.error during tests by mocking it
        originalConsoleError = console.error;
        console.error = jest.fn();
    });
    
    afterEach(() => {
        lastStudyDate = null;
        jest.clearAllMocks();
        console.error = originalConsoleError; // Restore console.error
    });

    describe('updateStudyStreak', () => {
        it('should increment studyStreak if student also studied yesterday', async () => {
            const studyStreak = 5;
            lastStudyDate.setDate(today.getDate() - 1); // Yesterday

        }); 

        it('should update lastStudyDate if student also studied yesterday', async () => {

        });

        it('should reset studyStreak if it has been broken', async () => {

        });

        it('should throw custom error (errorCode E0019) if update fails', async () => {
           
        });
    });

    describe('ensureStudyStreakConsistency', () => {
        it('should reset studyStreak if it has been broken', async () => {
            lastStudyDate.setDate(lastStudyDate.getDate() - 2); // 2 days ago

            StudentModel.findByIdAndUpdate.mockResolvedValue({});

            await ensureStudyStreakConsistency(mockId, lastStudyDate);

            expect(StudentModel.findByIdAndUpdate).toHaveBeenCalledWith(mockId, { studyStreak: 0 });
        });

        it('should not reset studyStreak if it has not been broken', async () => {
            lastStudyDate.setDate(lastStudyDate.getDate() - 1); // Yesterday

            await ensureStudyStreakConsistency(mockId, lastStudyDate);

            expect(StudentModel.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('should log an error if ensureStudyStreakConsistency fails', async () => {
            lastStudyDate.setDate(lastStudyDate.getDate() - 2); // 2 days ago
            StudentModel.findByIdAndUpdate.mockRejectedValue(new Error('Failed to ensure study streak consistency!'));

            console.error = jest.fn();

            await ensureStudyStreakConsistency(mockId, lastStudyDate);

            expect(console.error).toHaveBeenCalledWith('Failed to ensure study streak consistency!');
        });
    });
});