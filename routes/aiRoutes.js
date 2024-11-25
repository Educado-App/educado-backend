const express = require('express');
const { spawn } = require('child_process');
const multer = require('multer');
const router = express.Router();
const { shorttermLimiter, longtermLimiter } = require('../middlewares/rate_limiting');
const Feedback = require('../models/Feedback');

//get all feedbacks
router.get('/feedbacks', shorttermLimiter, longtermLimiter, async (req, res) => {
	try {
		const feedbacks = await Feedback.find();
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

router.get('/', shorttermLimiter, longtermLimiter,  (req, res) => {
	console.log('GET request received at /api/ai');
	res.send('AI Route is working!!!???!');
});

router.post('/', shorttermLimiter, longtermLimiter, async (req, res) => {
	req.setTimeout(30000);
	const { userInput } = req.body;

	if (!userInput) {
		return res.status(400).json({ error: 'userInput are required' });
	}

	try {
		console.log('Starting Python script...');
		const python = spawn('python3', ['./Ai/Openai.py', userInput]);
		let output = '';
		let errorOutput = '';

		python.stdout.on('data', (data) => {
			output += data.toString();
		});

		python.stderr.on('data', (data) => {
			errorOutput += data.toString();
			console.error('Python Error:', errorOutput);
		});

		python.on('error', (err) => {
			console.error('Failed to start Python process:', err);
			res.status(500).json({ error: 'Failed to start Python script' });
		});

		python.on('close', (code) => {
			if (code === 0) {
				if (output) {
					console.log('returning' + output);
					res.json({ message: output });
				} else {
					res.status(500).json({ error: 'Python script returned no output' });
				}
			} else {
				const errorMsg = errorOutput || `Python process exited with code ${code}`;
				res.status(500).json({ error: errorMsg });
			}
		});
	} catch (error) {
		console.error('Server Error:', error.message);
		res.status(500).json({ error: 'Error running Python script' });
	}
});

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Determine Python command based on the operating system
const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

// Route for handling MP3 upload, processing it without saving to disk
router.post('/processAudio', shorttermLimiter, longtermLimiter, upload.single('audio'), (req, res) => {
	console.log('Audio processing request received');

	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	try {
		// Step 1: Transcribe audio using the first Python script
		console.log('Starting transcription with Python script...');
		const sttPython = spawn(pythonCommand, ['./Ai/transcribeAudio.py'], {
			stdio: ['pipe', 'pipe', 'pipe']
		});

		sttPython.stdin.write(req.file.buffer);
		sttPython.stdin.end();

		let sttOutput = '';
		let sttError = '';

		sttPython.stdout.on('data', (data) => {
			sttOutput += data.toString();
		});

		sttPython.stderr.on('data', (data) => {
			sttError += data.toString();
			console.error('STT Error:', sttError);
		});

		sttPython.on('close', (sttCode) => {
			if (sttCode !== 0) {
				const errorMsg = sttError || `STT script exited with code ${sttCode}`;
				console.error('STT Process Error:', errorMsg);
				return res.status(500).json({ error: errorMsg });
			}

			const transcription = sttOutput.trim();
			console.log('STT Result:', transcription);

			// Step 2: Generate chatbot response using the second Python script
			console.log('Generating chatbot response with Python script...');
			const openaiPython = spawn(pythonCommand, ['./Ai/Openai.py', transcription]);

			let openaiOutput = '';
			let openaiError = '';

			openaiPython.stdout.on('data', (data) => {
				openaiOutput += data.toString();
			});

			openaiPython.stderr.on('data', (data) => {
				openaiError += data.toString();
				console.error('OpenAI Error:', openaiError);
			});

			openaiPython.on('close', (openaiCode) => {
				if (openaiCode !== 0) {
					const errorMsg = openaiError || `OpenAI script exited with code ${openaiCode}`;
					console.error('OpenAI Process Error:', errorMsg);
					return res.status(500).json({ error: errorMsg });
				}

				const chatbotResponse = openaiOutput.trim();
				console.log('Chatbot Response:', chatbotResponse);

				// Step 3: Generate audio from chatbot response using the third Python script
				console.log('Starting audio generation with Python script...');
				const audioBotPython = spawn(pythonCommand, ['./Ai/speechAi.py', chatbotResponse]);

				let audioBotError = '';
				let audioBotOutput = [];

				audioBotPython.stdout.on('data', (chunk) => {
					audioBotOutput.push(chunk);
				});

				audioBotPython.stderr.on('data', (data) => {
					audioBotError += data.toString();
					console.error('AudioBot Error:', audioBotError);
				});

				audioBotPython.on('close', (audioBotCode) => {
					if (audioBotCode !== 0) {
						const errorMsg = audioBotError || `AudioBot script exited with code ${audioBotCode}`;
						console.error('AudioBot Process Error:', errorMsg);
						return res.status(500).json({ error: errorMsg });
					}

					console.log('Audio generation completed.');

					// Combine the results
					res.setHeader('Content-Type', 'application/json');
					res.json({
						message: sttOutput,
						aiResponse: chatbotResponse, // The chatbot response
						audio: Buffer.concat(audioBotOutput).toString('base64') // Base64 encoded MP3 binary
					});
				});
			});
		});
	} catch (error) {
		console.error('Server Error:', error.message);
		res.status(500).json({ error: 'Error processing audio' });
	}
});



router.get('/stt', shorttermLimiter, longtermLimiter, (req, res) => {
	console.log('GET request received at /api/ai');
	res.send('AI Route is working!!!???!');
});

module.exports = router;
