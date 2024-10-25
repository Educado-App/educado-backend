//const router = express.Router();
const { spawn } = require('child_process');


/*router.post('/ai/', async (req, res) => {
	const { userInput, currentPage } = req.body;

	if (!userInput || !currentPage){
		return res.status(400).json({error: 'Prompt is required' })
	}

    const chatbot = spawn('python3', ['Ai/Openai.py', userInput, currentPage]);


    chatbot.stdout.on('data', (data) => {
        const response = data.toString();
        res.json({message: response})	
    });

    chatbot.stderr.on('data', (data) => {
        res.status(500).json({ error: 'Error running Python script'})

    });
    

});*/

const userInput = 'How are you today?';
const currentPage = '';
const chatbot = spawn('python3', ['./Ai/Openai.py', userInput, currentPage]);

chatbot.stdout.on('data', (data) => {
	const response = data.toString();
	console.log(response);
});

console.log(chatbot.response);



//module.exports = router;