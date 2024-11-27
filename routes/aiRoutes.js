/* eslint-disable indent */
const express = require('express');
const { spawn } = require('child_process');
const multer = require('multer');
const router = express.Router();
const { shorttermLimiter, longtermLimiter } = require('../middlewares/rate_limiting');
const Feedback = require('../models/Feedback');


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
        const newFeedback = new Feedback({
            userPrompt,
            chatbotResponse,
            feedback
        });
        await newFeedback.save();
        console.log('Feedback successfully saved', newFeedback);
        res.status(200).json({message: 'Feedback successfully saved'});
    } catch (error){
        console.error('error saving feedback', error.message);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

// Utility function to execute a Python script
const executePythonScript = (scriptPath, input = null, isBinary = false, courses = null) => {
    return new Promise((resolve, reject) => {
        const python = spawn(pythonCommand, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });
        console.log(courses);
        console.log(input);

        if (input && courses){
            const payload = JSON.stringify({ input, courses });
            
            python.stdin.write(payload);
            python.stdin.end();
        }else if(input){
            python.stdin.write(input);
            python.stdin.end();
        }


        let output = [];
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            if (isBinary) {
                output.push(data); // Collect binary chunks
            } else {
                output.push(data.toString()); // Collect text output
            }
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                if (isBinary) {
                    resolve(Buffer.concat(output)); // Return concatenated binary buffer
                } else {
                    resolve(output.join('').trim()); // Return concatenated string output
                }
            } else {
                reject(errorOutput || `Script exited with code ${code}`);
            }
        });
    });
};

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

module.exports = {
    router,
    executePythonScript,
    generateChatbotResponse,
    generateAudioResponse,
    transcribeAudio,
};