const cors = require('cors');

// Setup
const DOMAINS = [
	'http://127.0.0.1',
	'http://localhost',
	'http://deft-bubblegum-6da164.netlify.app',
	'https://deft-bubblegum-6da164.netlify.app',
	'http://app-staging.educado.io',
	'https://app-staging.educado.io',
];
const PORT = 5173;

const corsConfig = {
	origin: [],
	optionsSuccessStatus: 200,
	exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Add origins to CORS config
DOMAINS.forEach((domain) => {
	corsConfig.origin.push(`${domain}:${PORT}`);
});

// Export cors with config
module.exports = cors(corsConfig);