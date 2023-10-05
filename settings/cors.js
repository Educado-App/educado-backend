const cors = require('cors');

// Setup
const DOMAINS = ['http://127.0.0.1', 'http://localhost'];
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