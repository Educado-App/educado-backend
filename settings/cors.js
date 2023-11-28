const cors = require('cors');

const corsConfig = {
	origin: [
		'http://127.0.0.1:5173',
		'http://localhost:5173',
		'http://deft-bubblegum-6da164.netlify.app',
		'https://deft-bubblegum-6da164.netlify.app',
		'http://app-staging.educado.io',
		'https://app-staging.educado.io',
	],
	optionsSuccessStatus: 200,
	exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

// Export cors with config
module.exports = cors(corsConfig);
