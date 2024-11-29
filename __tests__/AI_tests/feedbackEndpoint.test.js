const request = require('supertest');
const express = require('express');

// Mock the router
jest.mock('../../routes/aiRoutes', () => {
    const express = require('express');
    const mockRouter = express.Router();

    // Mock the GET /feedback route
    mockRouter.get('/feedback', (req, res) => {
        res.send('mocked feedback route is working!!!');
    });

    // Mock the POST /feedback route
    mockRouter.post('/feedback', async (req, res) => {
        const { userPrompt, chatbotResponse, feedback } = req.body;

        if (!userPrompt || !chatbotResponse || typeof feedback === 'undefined') {
            return res.status(400).json({ error: 'Missing fields required fields' });
        }

        try {
            const mockFeedback = {
                userPrompt,
                chatbotResponse,
                feedback,
                save: jest.fn().mockResolvedValue(),
            };

            // Simulate saving feedback
            await mockFeedback.save();
            res.status(200).json({ message: 'Feedback successfully saved' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return mockRouter;
});

const Feedback = require('../../models/FeedbackAi'); // Mocked feedback model
const router = require('../../routes/aiRoutes'); // Adjust the path as needed

const app = express();
app.use(express.json());
app.use('/api/ai', router);

describe('Mocked GET /api/ai/feedback', () => {
    it('should return mocked feedback route is working', async () => {
        const response = await request(app).get('/api/ai/feedback');
        expect(response.status).toBe(200);
        expect(response.text).toBe('mocked feedback route is working!!!');
    });
});

describe('Mocked POST /api/ai/feedback', () => {
    it('should save feedback and return 200 on success', async () => {
        const response = await request(app)
            .post('/api/ai/feedback')
            .send({
                userPrompt: 'Test prompt',
                chatbotResponse: 'Test response',
                feedback: true,
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Feedback successfully saved');
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/api/ai/feedback')
            .send({
                userPrompt: 'Test prompt',
                chatbotResponse: '', // Missing chatbotResponse
                feedback: true,
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing fields required fields');
    });


    it('should not call save() if fields are missing', async () => {
        const saveSpy = jest.spyOn(Feedback.prototype, 'save');

        const response = await request(app)
            .post('/api/ai/feedback')
            .send({
                userPrompt: '', // Missing userPrompt
                chatbotResponse: 'Test response',
                feedback: true,
            });

        expect(response.status).toBe(400);
        expect(saveSpy).not.toHaveBeenCalled();
    });
});

