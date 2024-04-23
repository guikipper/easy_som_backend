const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_PASSWORD_CHANGE;
const getUser = require("../utils/getUser");
const sendErrorResponse = require("../utils/sendErrorResponse")

exports.recoverPasswordTokenValidation = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return sendErrorResponse(res, 403, "Token não fornecido.")
        }
        const token = authHeader.substring(7, authHeader.length);
        const decoded = jwt.verify(token, jwtSecret);
        const existingUser = await getUser(decoded.userId)

        if (!existingUser) {
            return sendErrorResponse(res, 403, "Usuário não encontrado.")
        }
        req.user = existingUser
        req.token = token
        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return sendErrorResponse(res, 404, "Token expirado.")
        } else if (error instanceof jwt.JsonWebTokenError) {
            return sendErrorResponse(res, 404, "Token inválido.")
        } else {
            return sendErrorResponse(res, 500, "Falha ao autenticar token.")
        }
    }   
}

