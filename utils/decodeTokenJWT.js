const jwt = require("jsonwebtoken");

const decodeToken = (token) => {
    const jwtSecret = process.env.JWT_SECRET;
    console.log("Recebendo o token: ", token)
    try {
        const decoded = jwt.verify(token, jwtSecret);
        return { valid: true, userId: decoded.userId };
    } catch (error) {
        console.error("Token verification error:", error.message);
        return { valid: false, error: error.message };
    }
}

module.exports = decodeToken

