const { verify } = require('../helpers/token');
const errorCodes = require('../helpers/errorCodes');

module.exports = async (req, res, next) => {

    try {
        const authHeader = req.headers.authorization;
        if (authHeader){
            if (!authHeader.startsWith('Bearer ')) {
                console.error('Authorization header missing or invalid');
                return res.status(401).send({ error: errorCodes['E0001'] });
            }

            const token = authHeader.split(' ')[1];

            try {
                claims = verify(token);
                req.tokenClaims = claims;
            } catch {
                return res.status(401).send({ error: errorCodes['E0001'] });
            }
        } else {
            try {
                claims = verify(req.headers.token);
                req.tokenClaims = claims;
            } catch {
                return res.status(401).send({ error: errorCodes['E0001'] });
            }

            if (req.params.id) {
                if (claims.id !== req.params.id || !claims.id) {
                    return res.status(401).send({ error: errorCodes['E0002'] });
                }
            }
        }
        
        // If token is present, proceed to the next middleware
        return next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).send({ error: errorCodes['E0001'] });
    }
};