const { Roles } = require('../../../helpers/roles/roles');
const { body } = require('express-validator');
const { findByEmail } = require('../../../services/v1/users/users');

const validationHandler = require('../../../helpers/handlers/validationHandler');

const signUpReq = [
  body('name')
    .exists()
    .withMessage('The email field is required')
    .bail()
    .trim()
    .escape(),

  body('email')
    .exists()
    .withMessage('The email field is requierd')
    .bail()
    .isEmail()
    .withMessage('The email field is invalid')
    .bail()
    .custom(async (email) => {
      try {
        const user = await findByEmail(email);
        if (user) throw new Error('The email exists already');
        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    })
    .bail()
    .trim()
    .escape(),

  body('password')
    .exists()
    .withMessage('The password field is required')
    .bail()
    /* 
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    */
    .isStrongPassword()
    .withMessage(
      'The password field must have a minimum of 8 characters, a minimum of 1 lowercase, a minimum of 1 uppercase, 1 number and 1 symbol'
    )
    .bail()
    .trim()
    .escape(),

  body('confirmPassword')
    .exists()
    .withMessage('The confirmPassword field is required')
    .bail()
    .custom((confirmPassword, { req }) => {
      if (confirmPassword.trim() !== req.body.password.trim())
        throw new Error('Password do not match');
      return true;
    })
    .bail()
    .trim()
    .escape(),

  body('roles')
    .exists()
    .withMessage('The role field is required')
    .bail()
    .isArray()
    .withMessage('The role field must be an array')
    .bail()
    .isIn(Object.values(Roles))
    .withMessage(`Only allowed ${Object.values(Roles).join(', ')}`)
    .bail(),

  body('accountConfirmationPath')
    .exists()
    .withMessage('The accountConfirmationPath field is required')
    .bail()
    .isURL()
    .withMessage('The accountConfirmationPath field must be an URL')
    .bail()
    .custom((value, { req }) => {
      if (value.endsWith('/')) {
        req.body.accountConfirmationPath = value.substring(0, value.length - 1);
      }
      return true;
    })
    .trim()
    .bail(),

  (req, res, next) => {
    validationHandler(req, res, next);
  },
];

const loginReq = [
  body('email')
    .exists()
    .withMessage('The email field is required')
    .bail()
    .isEmail()
    .withMessage('The email field is invalid')
    .trim()
    .escape(),

  body('password')
    .exists()
    .withMessage('The password field is required')
    .bail()
    .trim()
    .escape(),
  (req, res, next) => {
    validationHandler(req, res, next);
  },
];

module.exports = {
  signUpReq,
  loginReq,
};
