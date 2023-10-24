const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });

// Access the environment variables
const keys = {
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.MONGO_URI,
  cookieKey: process.env.COOKIE_KEY,
  bucketKey: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
};

module.exports = keys;