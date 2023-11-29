// Passport authentication imports
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Models
const { UserModel } = require('../models/Users');

// Import consts
const keys = require('./../config/keys');

// ** SERIALIZATION & DESERIALIZATION ** //
passport.serializeUser((user, done) => {
	// Serialize user with user.id. This is send TO the client FROM the server.
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	// When client contacts server with cookie, desearilise extracts the ID, Find user in Database with that ID, and return user.
	UserModel.findById(id).then((user) => {
		done(null, user);
	});
});

// Google OAuth Strategy 1: Login
passport.use(
	'google',
	new GoogleStrategy(
		{
			clientID: keys.googleClientID,
			clientSecret: keys.googleClientSecret,
			callbackURL: '/auth/google/callback',
			proxy: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			const existingUser = await UserModel.findOne({ googleID: profile.id }); // Look through User collection for an instance already with the ID
			if (existingUser) {
				// If existingUser exists, we already have a record with the given profile ID
				done(null, existingUser); // Inform passport that authentication is done. Return null for error, and the existing user
			} else {
				// We dont have a user record with this ID, make a new record
				const user = await new UserModel({
					googleID: profile.id, // Creates instance of User with the unique profile ID from Google OAuth
				}).save();
				done(null, user); // Wait for asyncronious DB call to finish, and return the created user
			}
		}
	)
);

// Google OAuth Strategy 1: Login
passport.use(
	'google-restricted',
	new GoogleStrategy(
		{
			clientID: keys.googleClientID,
			clientSecret: keys.googleClientSecret,
			callbackURL: '/auth/google/callback',
			proxy: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			// Find user with email of the one clicking
			let existingUser;
			let index;

			for (let i = 0; i < profile.emails.length; i++) {
				const tempUser = await UserModel.findOne({ email: profile.emails[i].value });

				if (tempUser) {
					existingUser = tempUser;
					index = i;
				}
			}

			// If such a user exist
			if (existingUser) {
				// If that user ALREADY has a Google ID, finish with that user
				if (existingUser.googleID) {
					done(null, existingUser);
				} else {
					// Else remove user, add new with ID and email
					await UserModel.remove({ email: profile.emails[index].value });
					const user = await new UserModel({
						googleID: profile.id,
						email: profile.emails[index].value,
					}).save();
					done(null, user); // Finish with NEW user
				}
			} else {
				// Only here, if user is NOT registered in Database
				done(null, false); // Return with "unauthorized error"
			}
		}
	)
);
