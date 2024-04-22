const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_PASSWORD_CHANGE;
const getUser = require("../utils/getUser");

exports.recoverPasswordTokenValidation = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return res.status(403).send({ message: 'Token não fornecido.' });
        }
        const token = authHeader.substring(7, authHeader.length);
        const decoded = jwt.verify(token, jwtSecret);
        const existingUser = await getUser(decoded.userId)

        if (!existingUser) {
            return res.status(403).send({ message: 'Token inválido.' });
        }
        req.user = existingUser
        req.token = token
        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return { userId: null, error: "Token has expired." };
        } else if (error instanceof jwt.JsonWebTokenError) {
            return { userId: null, error: "Invalid token." };
        } else {
            return { userId: null, error: "Failed to authenticate token." };
        }
    }   
}

