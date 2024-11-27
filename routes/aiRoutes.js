/* eslint-disable indent */
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { shorttermLimiter, longtermLimiter } = require('../middlewares/rate_limiting');
const FeedbackAi = require('../models/FeedbackAi');
const executePythonScript = require('../helpers/excutePython.js')


//get all feedbacks
router.get('/feedbacks', shorttermLimiter, longtermLimiter, async (req, res) => {
	try {
		const feedbacks = await FeedbackAi.find();
		res.json(feedbacks);
	} catch (error){
		console.error('error fetching feedbacks', error.message);
		res.status(500).json({error: 'Internal server error'});
	}
});

router.get('/feedback', shorttermLimiter, longtermLimiter, async (req, res) => {
    console.log('GET request received at /api/ai/feedback');
	res.send('feedback route is working!!!???!');
});

router.post('/feedback', shorttermLimiter, longtermLimiter, async (req, res) => {
    const { userPrompt, chatbotResponse, feedback } = req.body;

    if (!userPrompt || !chatbotResponse || typeof feedback === 'undefined'){
        return res.status(400).json({error: 'Missing fields required fields'});
    }

    try {
        const newFeedbackAi = new FeedbackAi({
            userPrompt,
            chatbotResponse,
            feedback
        });
        await newFeedbackAi.save();
        console.log('Feedback successfully saved', newFeedbackAi);
        res.status(200).json({message: 'Feedback successfully saved'});
    } catch (error){
        console.error('error saving feedback', error.message);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Step 1: Transcribe audio
const transcribeAudio = async (audioBuffer) => {
    console.log('Starting transcription...');
    return await executePythonScript('./Ai/transcribeAudio.py', audioBuffer);
};

// Step 2: Generate chatbot response
const generateChatbotResponse = async (question, courses) => {
    console.log('Generating chatbot response... ' + question);
    return await executePythonScript('./Ai/Openai.py', question, false, courses);
};

// Step 3: Generate audio response
const generateAudioResponse = async (chatbotResponse) => {
    console.log('Generating audio response...');
    return await executePythonScript('./Ai/speechAi.py', chatbotResponse, true); // Pass true for binary output
};


router.get('/', shorttermLimiter, longtermLimiter,  (req, res) => {
	console.log('GET request received at /api/ai');
	res.send('AI Route is working!!!???!');
});

router.post('/', shorttermLimiter, longtermLimiter, async (req, res) => {
	const { userInput, courses } = req.body;

	try {
        if (!userInput) {
			return res.status(400).json({ error: 'userInput are required' });
		}

        // Step 1: Chatbot Response
        const chatbotResponse = await generateChatbotResponse(userInput, courses);

        // Step 2: Audio Generation
        const audioBinary = await generateAudioResponse(chatbotResponse);

        console.log('Audio processing completed.');
		console.log('response is ' + chatbotResponse );

        // Combine the results and respond
        res.setHeader('Content-Type', 'application/json');
		
        res.json({
            message: chatbotResponse,
            audio: audioBinary.toString('base64'), // Convert binary data to Base64
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});





// Route for processing audio
router.post('/processAudio', shorttermLimiter, longtermLimiter, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const audioBuffer = req.file.buffer;
        const courses = JSON.parse(req.body.courses);

        // Step 1: Transcription
        const transcription = await transcribeAudio(audioBuffer);
        console.log('trans= ' + transcription);

        // Step 2: Chatbot Response
        const chatbotResponse = await generateChatbotResponse(transcription,courses);

        // Step 3: Audio Generation
        const audioBinary = await generateAudioResponse(chatbotResponse);

        console.log('Audio processing completed.');

        // Combine the results and respond
        res.setHeader('Content-Type', 'application/json');
        res.json({
            message: transcription,
            aiResponse: chatbotResponse,
            audio: audioBinary.toString('base64'), // Convert binary data to Base64
        });
    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

module.exports = router;