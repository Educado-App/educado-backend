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

    res.json({ message: userInput });

    if (!userInput || !currentPage) {
        return res.status(400).json({ error: 'userInput and currentPage are required' });
    }

    try {
        res.json({ message: userInput });
        /*
        console.log("Starting Python script...");
        const python = spawn('C:/Python311/python.exe', ['./Ai/Openai.py', userInput, currentPage]);
        let output = '';
    
        python.stdout.on('data', (data) => {
            output += data.toString();
        });
    
        python.stderr.on('data', (data) => {
            console.error('Python Error:', data.toString());
        });*/
    
        /*python.on('close', (code) => {
            if (code === 0) {
                res.json({ message: output });
            } else {
                res.status(500).json({ error: `Python process exited with code ${code}` });
            }
        });*/

        res.json({ message: output });
    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: 'Error running Python script' });
    }
    
});

module.exports = router;
