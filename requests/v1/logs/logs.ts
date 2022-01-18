import { Request, Response, NextFunction } from 'express';
import { param, body } from 'express-validator';
import validationHandler from '../../../helpers/v1/handlers/validationHandler';
import UsersService from '../../../services/v1/users/users';

export const getLogReq = [
  param('logId')
    .exists()
    .withMessage('The id param is required')
    .bail()
    .toInt()
    .withMessage('The logId param is invalid'),

  body('userId')
    .exists()
    .withMessage('The userId field is required')
    .bail()
    .isInt()
    .withMessage('The userId field must be a number')
    .bail()
    .custom((userId) => {
      return UsersService.checkUser(userId);
    }),

  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
