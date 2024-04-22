const express = require('express')
const router = express.Router()
const dataController = require('../controller/Controller')
const sessionDataController = require('../controller/SessionDataController')

const { loginValidationRules, validateLogin } = require('../validations/loginValidations')
const { createUserValidationRules, validateCreateUser} = require('../validations/createUserValidations')
const { validateToken } = require('../validations/tokenValidation')
const { recoverPasswordTokenValidation } = require('../validations/recoverPasswordTokenValidation')
const { sendPasswordRecoveryEmailValidator, validatesendPasswordRecoveryEmail } = require('../validations/sendPasswordRecoveryEmailValidator')
const { changeNameValidations, validateChangeName} = require("../validations/changeNameValidations")
const { resendEmailVerificationValidationRules, validateSendVerificationEmail } = require("../validations/resendEmailVerificationValidations")

router.post('/createUser', createUserValidationRules, validateCreateUser, dataController.createUser.bind(dataController))
router.post('/resendEmailVerification', resendEmailVerificationValidationRules, validateSendVerificationEmail, dataController.resendEmailVerification)
router.post('/validate', validateToken, dataController.validateLink)
router.post('/login', loginValidationRules, validateLogin, dataController.login)
router.post('/changeName', validateToken, changeNameValidations, validateChangeName, dataController.changeName)
router.post('/changePassword', validateToken, dataController.changePassword)
router.post('/deleteAccount', validateToken, dataController.deleteAccount)
router.post('/authenticate', validateToken, dataController.authenticate)
router.post('/sendPasswordRecovery', sendPasswordRecoveryEmailValidator, validatesendPasswordRecoveryEmail, dataController.sendPasswordRecovery)
router.post('/recoverPassword', recoverPasswordTokenValidation, dataController.recoverPassword)
router.post('/saveTrainingData', validateToken, sessionDataController.saveTrainingData)
router.get('/getTrainingSummary', validateToken, sessionDataController.getTrainingSummary)
router.get('/', dataController.test)

module.exports = router

