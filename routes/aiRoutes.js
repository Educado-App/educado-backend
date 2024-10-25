const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

const CHATBOT_API_URL = 'http://localhost:5000/chat'; // URL of your Python chatbot

// Chat endpoint to interact with the Python chatbot using OpenAI API
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        const response = await axios.post(CHATBOT_API_URL, { message: userMessage });
        res.json(response.data);
    } catch (error) {
        console.error('Error communicating with chatbot:', error);
        res.status(500).send('Internal Server Error');
    }
});

// AI endpoint to interact with the Python script directly
app.post('/ai', async (req, res) => {
    const { userInput, currentPage } = req.body;

    if (!userInput || !currentPage) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Use path.resolve to ensure the correct path is used
    const chatbot = spawn('python3', [path.resolve(__dirname, '../Ai/Openai.py'), userInput, currentPage]);

    let responded = false;

    chatbot.stdout.on('data', (data) => {
        if (!responded) {
            const response = data.toString().trim();
            res.json({ message: response });
            responded = true;
        }
    });

    chatbot.stderr.on('data', (data) => {
        if (!responded) {
            console.error(`stderr: ${data}`);
            res.status(500).json({ error: 'Python script encountered an error' });
            responded = true;
        }
    });


    chatbot.on('error', (error) => {
        console.error(`Error spawning Python process: ${error}`);
        res.status(500).json({ error: 'Failed to start Python script' });
    });

    chatbot.on('exit', (code) => {
        console.log(`Python script exited with code: ${code}`);
    });
});

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Chatbot router running on port ${PORT}`);
});
