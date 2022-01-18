import { Request, Response, NextFunction } from 'express';
import validationHandler from '../../../helpers/v1/handlers/validationHandler';
import { body, param } from 'express-validator';
import { signUpReq } from '../auth/authRequests';
import { Roles } from '../../../helpers/v1/roles/roles';

export const createUserReq = signUpReq;

export const getUserReq = [
  param('id')
    .exists()
    .withMessage('The id param is required')
    .bail()
    .toInt()
    .withMessage('The id param is invalid'),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

export const updateUserReq = [
  param('id')
    .exists()
    .withMessage('The id param is required')
    .bail()
    .toInt()
    .withMessage('The id param is invalid'),

  body('name').optional({ checkFalsy: true }).trim().escape(),

  body('email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('The email field is invalid')
    .bail()
    .trim()
    .escape(),

  body('password')
    .optional({ nullable: true })
    /* 
      minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1,
    */
    .isStrongPassword()
    .withMessage(
      'The password field must have a minimum of 8 characters, a minimum of 1 lowercase, a minimum of 1 uppercase, 1 number and 1 symbol'
    )
    .bail()
    .trim()
    .escape(),

  body('roles')
    .optional({ nullable: true })
    .isArray()
    .withMessage('The role field must be an array')
    .bail()
    .isIn(Object.values(Roles))
    .withMessage(`Only allowed ${Object.values(Roles).join(', ')}`)
    .bail(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

export const deleteUserReq = [
  param('id')
    .exists()
    .withMessage('The id param is required')
    .bail()
    .toInt()
    .withMessage('The id param is invalid'),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

export const resetPasswordReq = [
  body('email')
    .exists()
    .withMessage('The email field is required')
    .bail()
    .isEmail()
    .withMessage('The email field is invalid')
    .bail()
    .trim()
    .escape(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

export const confirmToken = [
  param('token')
    .exists()
    .withMessage('The token field is required')
    .bail()
    .isString()
    .withMessage('The token field must be a string')
    .bail()
    .isLength({ min: 44, max: 44 })
    .withMessage('The token length is invalid')
    .trim(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

export const updatePassword = [
  param('token')
    .exists()
    .withMessage('The token field is required')
    .bail()
    .isString()
    .withMessage('The token field must be a string')
    .bail()
    .isLength({ min: 44, max: 44 })
    .withMessage('The token length is invalid')
    .trim(),

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
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
