const rateLimit = require('express-rate-limit');

const shorttermLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds for testing
    max: 5, // Limit each IP to 5 requests per 10 seconds
    message: "Too many requests, please try again later, fuck off please, u idiot",
});

const longtermLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 100, // Limit each IP to 100 requests per hour
    message: "Too many requests, long term failure",
});


module.exports = { shorttermLimiter, longtermLimiter };
