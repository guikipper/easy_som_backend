const { body, validationResult } = require("express-validator");
const getUserByEmail = require("../utils/getUserByEmail");

exports.createUserValidationRules = [
  body("name")
  .escape()
  .customSanitizer(value => value.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, ''))
  .customSanitizer(value => value.replace(/\s+/g, ' '))
  .customSanitizer(value => 
    value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
  )
  .isLength({ min: 2 }).withMessage("O nome não pode ser vazio ou conter somente um caractere.")
  .trim()
  .isLength({ max: 60 }), 
  body("email").isEmail().withMessage("Email inválido.").normalizeEmail().custom(async(email) => {
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      throw new Error("Email já cadastrado.");
    }
  }),
  body("password")
    .trim()
    .escape()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/)
    .withMessage(
      "A senha deve ter no mínimo 9 caracteres, incluir números, letras maiúsculas e minúsculas."
    ),
];

exports.validateCreateUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validate: ", errors.array(validationResult));

    return res.status(400).json({
      error: {
        code: 400,
        message: "Houve erro(s) na valiação.",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }
  next();
};
