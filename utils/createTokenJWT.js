const createTokenJWT = (userId) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwt = require('jsonwebtoken');
    return jwt.sign({ userId }, jwtSecret, { expiresIn: '12h' });
}

module.exports = createTokenJWT