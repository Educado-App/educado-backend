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
        claims = verify(token);
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).send({ error: errorCodes['E0001'] });
    }

    // Check if the user is an admin
    if (claims.role === 'admin') {
        return next();
    }

    if (req.params.id) {
        console.log('Request params ID:', req.params.id); // Log the request params ID
        if (claims.id !== req.params.id || !claims.id) {
            console.error('Claims ID does not match request ID or ID is missing');
            return res.status(401).send({ error: errorCodes['E0002'] });
        }
    }

    next(); // Delete if not needed
};