const { body, validationResult } = require("express-validator");

exports.changeNameValidations = [
  body("newName")
  .escape()
  .customSanitizer(value => value.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, ''))
  .customSanitizer(value => value.replace(/\s+/g, ' '))
  .customSanitizer(value => 
    value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
  )
  .isLength({ min: 2 }).withMessage("O nome não pode ser vazio ou conter somente um caractere.")
  .trim()
  .isLength({ max: 60 })
];

exports.validateChangeName = (req, res, next) => {
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
