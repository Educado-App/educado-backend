// Constant requires
const cors = require('./settings/cors');
const context = require('./middlewares/context');

const express = require('express');
const { connectToDb } = require('./db');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const router = require('./routes');
const passport = require('passport');
const { createTimeSeriesCollection } = require('./db/timeSeriesCollection');
const { addMetricsData } = require('./scripts/addMetricsData');
const cron = require('node-cron');

/* global process */
const PORT = process.env.PORT || 8888; // Get dynamic port allocation when deployed by Heroku. Otherwise, by default, use port 5000

// Setup connection to database
connectToDb(keys.mongoURI, {
	dbName: process.env.NODE_ENV === 'production' ? 'prod' : 'test',
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true,
}).then(async () => {
	await createTimeSeriesCollection();
	await addMetricsData();
	// Schedule the task to run every minute
	cron.schedule('* * * * *', async () => {
		console.log('Taking snapshot...');
		await addMetricsData();
	});
}).catch((error) => {
	console.error('Error connecting to mongoDB:', error);
});

const app = express(); // Configuration for listening, communicate to handlers

// Simple logging middleware for testing
app.use((req, res, next) => {
	req.protocol + '://' + req.get('host') + req.originalUrl;
	next();
});
app.use(
	cookieSession({
		maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie should last for 30 days before automatic expiration
		keys: [keys.cookieKey], // Specify encryption key for cookie
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cors);
app.use(context);
app.use('', router);

// Run if running in production on Heroku
if (process.env.NODE_ENV === 'production') {
	// Make sure that express handles production correctly
	// Make sure that express serves prodcution assets
	app.use(express.static('client-web/build'));

	// Express will serve up the index.html file if it doesn't recognize the route
	const path = require('path');
	app.get('*', (req, res) => 
	{
		/* global __dirname */
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

// Run server
app.listen(PORT, () => {
	console.log(`⚡ Running app at ${keys.WEB_HOST || 'http://localhost'}:${PORT}`);
});