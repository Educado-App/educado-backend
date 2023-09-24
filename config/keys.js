const dotenv = require("dotenv");

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "./config/.env.prod" });
} else {
  dotenv.config({ path: "./config/.env" });
}

// Access the environment variables
const keys = {
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.MONGO_URI_TEST,
  cookieKey: process.env.COOKIE_KEY,
  bucketKey: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

module.exports = keys;