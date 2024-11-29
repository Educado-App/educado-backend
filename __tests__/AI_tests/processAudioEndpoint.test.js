const request = require('supertest');
const express = require('express');
const multer = require('multer');

const app = express();
app.use(express.json());

const transcribeAudio = jest.fn();
const generateChatbotResponse = jest.fn();
const generateAudioResponse = jest.fn();

const upload = multer();

const router = express.Router();

router.post('/processAudio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const audioBuffer = req.file.buffer;

        const transcription = await transcribeAudio(audioBuffer);
        const chatbotResponse = await generateChatbotResponse(transcription);
        const audioBinary = await generateAudioResponse(chatbotResponse);

        res.setHeader('Content-Type', 'application/json');
        res.json({
            message: transcription,
            aiResponse: chatbotResponse,
            audio: audioBinary.toString('base64'),
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

app.use('/api/ai', router);

describe('POST /api/ai/processAudio', () => {
    it('should return 400 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/api/ai/processAudio')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No file uploaded');
    });

    it('should return 200 with the correct response if file is uploaded', async () => {
        const fakeAudioBuffer = Buffer.from('fake audio data');
        const fakeTranscription = 'fake transcription';
        const fakeChatbotResponse = 'fake chatbot response';
        const fakeAudioBinary = Buffer.from('fake audio binary');

        transcribeAudio.mockResolvedValue(fakeTranscription);
        generateChatbotResponse.mockResolvedValue(fakeChatbotResponse);
        generateAudioResponse.mockResolvedValue(fakeAudioBinary);

        const response = await request(app)
            .post('/api/ai/processAudio')
            .attach('audio', fakeAudioBuffer, 'audio.wav');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(fakeTranscription);
        expect(response.body.aiResponse).toBe(fakeChatbotResponse);
        expect(response.body.audio).toBe(fakeAudioBinary.toString('base64'));
    });

    it('should return 500 if an error occurs during processing', async () => {
        const fakeAudioBuffer = Buffer.from('fake audio data');

        transcribeAudio.mockImplementationOnce(() => {
            throw new Error('Transcription error');
        });

        const response = await request(app)
            .post('/api/ai/processAudio')
            .attach('audio', fakeAudioBuffer, 'audio.wav');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});