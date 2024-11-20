const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();
const { shorttermLimiter, longtermLimiter } = require('../middlewares/rate_limiting');


// Apply rate limiter to the GET route
router.get('/', shorttermLimiter, longtermLimiter , (req, res) => {
    console.log('GET request received at /api/ai');
    res.send('AI Route is working');
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



module.exports = router;
