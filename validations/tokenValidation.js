const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const getUser = require("../utils/getUser");
const checkUserIsBlocked = require("../utils/checkUserIsBlocked")
const sendErrorResponse = require("../utils/sendErrorResponse")

exports.validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if(!authHeader) {
            sendErrorResponse(res, 403, "Token não fornecido.")
        }
        
        const token = authHeader.substring(7, authHeader.length);
        const decoded = jwt.verify(token, jwtSecret);
        const existingUser = await getUser(decoded.userId)
        
        if (!existingUser) {
            sendErrorResponse(res, 403, "Token inválido.")
        }

        const isBlocked = await checkUserIsBlocked(existingUser._id)
        const now = new Date();
      
      if (isBlocked && now < isBlocked) {
        return sendErrorResponse(res, 404, "Usuário bloqueado por limite de tentativas.", "Por favor, tente novamente mais tarde.")
      }

        req.user = existingUser
        next()
    } catch (error) {
        sendErrorResponse(res, 401, "Token inválido ou expirado.", error)
    }   
}

