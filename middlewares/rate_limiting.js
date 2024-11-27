const rateLimit = require('express-rate-limit');

const shorttermLimiter = rateLimit({
	windowMs: 10 * 1000, // 10 seconds for testing
	max: 50000, // Limit each IP to 5 requests per 10 seconds
	message: { error: 'Desacelere! Muitas solicitações.' },
});

const longtermLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, 
	max: 1000000, // Limit each IP to 100 requests per hour
	message: { error: 'Você excedeu o limite por hora. Por favor, tente novamente mais tarde.' },
});


module.exports = { shorttermLimiter, longtermLimiter };
