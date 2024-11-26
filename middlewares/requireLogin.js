const { verify } = require('../helpers/token');
const errorCodes = require('../helpers/errorCodes');
const { UserModel } = require('../models/Users');

module.exports = async (req, res, next) => {
	let claims;

	try {
		const authHeader = req.headers.authorization;
		if (authHeader) {
			if (!authHeader.startsWith('Bearer ')) {
				console.error('Authorization header missing or invalid');
				return res.status(401).send({ error: errorCodes['E0001'] });
			}

			const token = authHeader.split(' ')[1];

			try {
				claims = verify(token);
				req.tokenClaims = claims;
			} catch (error) {
				console.error('Token verification failed:', error);
				return res.status(401).send({ error: errorCodes['E0001'] });
			}
		} else {
			try {
				claims = verify(req.headers.token);
				req.tokenClaims = claims;
			} catch (error) {
				console.error('Token verification failed:', error);
				return res.status(401).send({ error: errorCodes['E0001'] });
			}
		}

		// Fetch user details and set req.user
		const user = await UserModel.findById(claims.id);
		if (!user) { 
			console.error('User not found');
			return res.status(401).send({ error: errorCodes['E0001'], message: 'User not found' });
		}
		req.user = user;

		// Admin
		if (claims.role === 'admin') return next();

		// Non-admin 
		if (!req.params.id || claims.id === req.params.id) {
			// If token is present, proceed to the next middleware
			return next();
		} else {
			return res.status(401).send({ error: errorCodes['E0002'] });
		}
	} catch (error) {
		console.error('Token verification failed:', error);
		return res.status(401).send({ error: errorCodes['E0001'] });
	}
};