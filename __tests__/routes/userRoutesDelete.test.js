/**
 * @file userRoutesDelete.test.js
 * @description Test suite for the DELETE request route in userRoutes.js using a simulated in-memory database.
 */

// Testing libraries
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Routes
const router = require('../../routes/userRoutes');

// Fixtures
const createMockUser = require('../fixtures/fakeUser');
const createMockStudent = require('../fixtures/fakeStudent');

// Helpers
const { signAccessToken } = require('../../helpers/token');
const { handleAccountDeletion } = require('../../helpers/userHelper');

// Models
const { UserModel } = require('../../models/Users');
const { StudentModel } = require('../../models/Students');

// Mock models to isolate database interactions during testing 
jest.mock('../../models/Users');
jest.mock('../../models/Students');
jest.mock('../../models/Courses');
jest.mock('../../models/Profile');
jest.mock('../../models/ContentCreators');
jest.mock('../../models/Applications');
jest.mock('../../models/ProfileEducation');
jest.mock('../../models/ProfileExperience');
jest.mock('../../helpers/userHelper');
jest.mock('../../config/keys', () => ({
	TOKEN_SECRET: 'test-secret'
}));

// Express and mongo server
const app = express();
let mongoServer;
app.use(express.json());
app.use('/api/users', router);

beforeAll(async () => {
    // Setup Express server and connect to a simulated in-memory database before running tests
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Test suite
describe('DELETE /api/users/:id', () => {
    let mockUserToken, mockAdminToken, insertedMockUser, originalConsoleError;

    beforeEach(async () => {
        // Insert the mockUser into simulated database
        const mockUser = createMockUser();
        UserModel.create.mockResolvedValue(mockUser);
        insertedMockUser = { ...mockUser, _id: new mongoose.Types.ObjectId() };
        UserModel.findOne.mockResolvedValue(insertedMockUser);
        UserModel.findById.mockResolvedValue(insertedMockUser);

        // Insert the mockStudent into simulated database
        const mockStudent = createMockStudent(insertedMockUser._id);
        StudentModel.create.mockResolvedValue(mockStudent);
        StudentModel.findOne.mockResolvedValue(mockStudent);

        // Generate a token for the mockUser
        mockUserToken = signAccessToken({ id: insertedMockUser._id, role: "user" });

        // Insert the mockAdmin into simulated database
        const mockAdminId = new mongoose.Types.ObjectId();
        mockAdminToken = signAccessToken({ id: mockAdminId, role: "admin" });

        handleAccountDeletion.mockResolvedValue();

        // Suppress console.error during tests by mocking it
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
        console.error = originalConsoleError; // Restore console.error
    });

    // User deleting own account
    it('should allow user to delete their own account successfully', async () => {
        await request(app)
            .delete(`/api/users/${insertedMockUser._id}`)
            .set('Authorization', `Bearer ${mockUserToken}`)
            .expect(200);

        expect(handleAccountDeletion).toHaveBeenCalledWith(insertedMockUser._id);
    });

    // Admin deleting another user
    it('should allow admin to delete another account successfully', async () => {
        await request(app)
            .delete(`/api/users/${insertedMockUser._id}`)
            .set('Authorization', `Bearer ${mockAdminToken}`)
            .expect(200);

        expect(handleAccountDeletion).toHaveBeenCalledWith(insertedMockUser._id);
    });

    // Non-existing user
    it('should return 404 for non-existing user', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        UserModel.findById.mockResolvedValue(null);

        await request(app)
            .delete(`/api/users/${nonExistentUserId}`)
            .set('Authorization', `Bearer ${mockAdminToken}`)
            .expect(404);

        expect(UserModel.findById).toHaveBeenCalledWith(nonExistentUserId);
    });

    // Invalid id
    it('should return 400 for invalid user ID', async () => {
        const invalidId = 'invalidId';

        await request(app)
            .delete(`/api/users/${invalidId}`)
            .set('Authorization', `Bearer ${mockAdminToken}`)
            .expect(400);

        expect(UserModel.findById).not.toHaveBeenCalled();
    });
});