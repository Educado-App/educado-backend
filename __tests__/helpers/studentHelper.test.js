const mongoose = require('mongoose');
const { updateStudyStreak, differenceInDays, ensureStudyStreakConsistency } = require('../../helpers/studentHelper');
const { StudentModel } = require('../../models/Students');

// Mock mongoose, database model and functions
jest.mock('mongoose');
jest.mock('../../models/Students', () => ({ 
    StudentModel: { 
        findById: jest.fn(), 
        findByIdAndUpdate: jest.fn() 
    } 
}));

describe('studentHelper', () => {
    let mockStudent;
    let originalConsoleError;
    const mockId = new mongoose.Types.ObjectId('1234567890abcdef12345678');
    const today = new Date();
    const yesterday = new Date(today);
    const twoDaysAgo = new Date(today);
    const sevenDaysAgo = new Date(today);
    
    // Set preceeding days
    yesterday.setDate(today.getDate() - 1);
    twoDaysAgo.setDate(today.getDate() - 2);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    beforeEach(() => {
        // Suppress console.error during tests by mocking it
        originalConsoleError = console.error;
        console.error = jest.fn();
    });
    
    afterEach(() => {
        mockStudent = null;
        jest.clearAllMocks();
        console.error = originalConsoleError; // Restore console.error
    });

    describe('updateStudyStreak', () => {
        it('should increment studyStreak if student also studied yesterday', async () => {
            mockStudent = {
                studyStreak: 3,
                lastStudyDate: yesterday,
            };

            StudentModel.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockStudent)
            });
            StudentModel.findByIdAndUpdate.mockResolvedValue({});
       
            await updateStudyStreak(mockId);
        
            expect(StudentModel.findById).toHaveBeenCalledWith(mockId);
            expect(StudentModel.findByIdAndUpdate).toHaveBeenCalledWith(mockId, expect.objectContaining({ studyStreak: 4 }));
        });    

        it('should soft reset studyStreak if it has been broken', async () => {
            mockStudent = {
                studyStreak: 3,
                lastStudyDate: twoDaysAgo,
            };

            StudentModel.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockStudent)
            });
            StudentModel.findByIdAndUpdate.mockResolvedValue({});
        
            await updateStudyStreak(mockId);
        
            expect(StudentModel.findById).toHaveBeenCalledWith(mockId);
            expect(StudentModel.findByIdAndUpdate).toHaveBeenCalledWith(mockId, expect.objectContaining({ studyStreak: 1 }));
        });
    });

    describe('differenceInDays', () => {
        it('should return 0 if dates are the same', () => {
            const result = differenceInDays(today, today);
            expect(result).toBe(0);
        });

        it('should return 1 if dates are one day apart', () => {
            const result = differenceInDays(yesterday, today);
            expect(result).toBe(1);
        });

        it('should return 7 if the dates are seven days apart', () => {
            const result = differenceInDays(sevenDaysAgo, today);
            expect(result).toBe(7);
        });
        
        it('should throw an error if either date is not a Date instance', () => {
            const notDateInstance = '2024-11-29T00:00:00.000Z';
            expect(() => differenceInDays(notDateInstance, today)).toThrow('lastStudyDate/currentDate is not a Date instance!');
        });
        
        it('should throw an error if either date is not a valid date', () => {
            const invalidDate = new Date('invalid date');
            expect(() => differenceInDays(invalidDate, today)).toThrow('lastStudyDate/currentDate is not a valid date!');
        });
    });
    
    describe('ensureStudyStreakConsistency', () => {
        it('should hard reset studyStreak if it has been broken', async () => {
            StudentModel.findByIdAndUpdate.mockResolvedValue({});

            await ensureStudyStreakConsistency(mockId, twoDaysAgo);

            expect(StudentModel.findByIdAndUpdate).toHaveBeenCalledWith(mockId, { studyStreak: 0 });
        });

        it('should not reset studyStreak if it has not been broken', async () => {
            await ensureStudyStreakConsistency(mockId, yesterday);

            expect(StudentModel.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('should log an error if ensureStudyStreakConsistency fails', async () => {
            StudentModel.findByIdAndUpdate.mockRejectedValue(new Error());

            await ensureStudyStreakConsistency(mockId, twoDaysAgo);

            expect(console.error).toHaveBeenCalledWith('Failed to ensure study streak consistency!');
        });
    });
});