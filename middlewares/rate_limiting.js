const rateLimit = require('express-rate-limit');

const criticalLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds for testing
    max: 5, // Limit each IP to 5 requests per 10 seconds
    message: "Too many requests, please try again later, fuck off please, u idiot",
});

module.exports = criticalLimiter;
