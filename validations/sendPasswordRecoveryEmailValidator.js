const { body, validationResult } = require("express-validator")
const sendErrorResponse = require("../utils/sendErrorResponse")

exports.sendPasswordRecoveryEmailValidator = [
    body('email').isEmail().normalizeEmail()
]

exports.validatesendPasswordRecoveryEmail = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        const details = errors.array().map((err) => {
            return {
                message: err.msg
            }
        })
        return sendErrorResponse(res, 400, "Email inválido.", details)
    }
    next()
}   