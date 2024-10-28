const { verify } = require('../helpers/token');
const errorCodes = require('../helpers/errorCodes');

module.exports = async (req, res, next) => {
    let claims;

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('Authorization header missing or invalid');
            return res.status(401).send({ error: errorCodes['E0001'] });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.error('Token missing');
            return res.status(401).send({ error: errorCodes['E0001'] });
        }

        // If token is present, proceed to the next middleware
        return next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).send({ error: errorCodes['E0001'] });
    }
};