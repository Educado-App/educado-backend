const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

router.get('/', (req, res) => {
    console.log("GET request received at /api/ai");
    res.send("AI Route is working!!!???!");
});

router.post('/', async (req, res) => {
    req.setTimeout(30000);
    const { userInput, currentPage } = req.body;

    if (!userInput || !currentPage) {
        return res.status(400).json({ error: 'userInput and currentPage are required' });
    }

    try {
        console.log("Starting Python script...");
        const python = spawn('python3', ['./Ai/Openai.py', userInput, currentPage]);
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
                    console.log("returning" + output);
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
        console.error("Server Error:", error.message);
        res.status(500).json({ error: 'Error running Python script' });
    }
});



module.exports = router;
