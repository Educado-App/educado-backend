const rateLimit = require('express-rate-limit');


const criticalLimiter = rateLimit({
    windowsMs: 10 * 60 * 1000,
    max: 20,
    mesage: "too many requests, fuck off"
});

app.get('/api/ai', criticalLimiter, (req, res) => {
    res.send('Critical api/ai endpoint');
});

