const jwt = require("jsonwebtoken");

const decodeTokenRecoverPassword = (token) => {
    try {
        const jwtSecret = process.env.JWT_SECRET_PASSWORD_CHANGE;
        const userId = jwt.verify(token, jwtSecret);
        return userId
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

module.exports = decodeTokenRecoverPassword

