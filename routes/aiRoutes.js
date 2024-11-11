const express = require('express');
const { spawn } = require('child_process');
const multer = require('multer');
const router = express.Router();

router.get('/', (req, res) => {
	console.log('GET request received at /api/ai');
	res.send('AI Route is working!!!???!');
});

router.post('/', async (req, res) => {
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
router.post('/stt', upload.single('audio'), (req, res) => {
	console.log("something hit")
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        console.log('Starting Python script with audio file buffer...');
        
        // Spawn the Python process and pass the audio buffer via stdin
        const python = spawn(pythonCommand, ['./Ai/transcribeAudio.py'], {
            stdio: ['pipe', 'pipe', 'pipe']  // Open stdin for passing data to Python
        });

        // Write the audio buffer to the Python process's stdin
        python.stdin.write(req.file.buffer);
        python.stdin.end();

        let output = '';
        let errorOutput = '';

        // Capture Python script output
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
                    console.log('Returning:', output);
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

router.get('/stt', (req, res) => {
	console.log('GET request received at /api/ai');
	res.send('AI Route is working!!!???!');
});

module.exports = router;
