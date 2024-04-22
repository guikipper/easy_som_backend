const { body, validationResult } = require("express-validator");
const getUserByEmail = require("../utils/getUserByEmail");

exports.resendEmailVerificationValidationRules = [
  body("email").isEmail().withMessage("Email inválido.").normalizeEmail().custom(async(email) => {
    const existingUser = await getUserByEmail(email)
    if (!existingUser) {
      throw new Error("Email não cadastrado.");
    }
    if (existingUser.emailVerified) {
        throw new Error("Email já foi verificado.");
    }
  }),
];

exports.validateSendVerificationEmail = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validate: ", errors.array(validationResult));

    return res.status(400).json({
      error: {
        code: 400,
        message: "Houve erro(s) na validação.",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }
  req.email = req.body.email;
  next();
};
