const { body, validationResult } = require('express-validator');
const sendErrorResponse = require("../utils/sendErrorResponse")

exports.loginValidationRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').trim().escape(),
];

exports.validateLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const details = errors.array().map((err) => {
        return {
          message: err.msg
        }
      })

    return sendErrorResponse(res, 400, "Email ou senha inválidos.", details)
  }
  next();
};
