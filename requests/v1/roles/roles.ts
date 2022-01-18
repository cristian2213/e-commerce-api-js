import { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import validationHandler from '../../../helpers/v1/handlers/validationHandler';
import { Roles } from '../../../helpers/v1/roles/roles';

export const createRoleReq = [
  body('name')
    .exists()
    .withMessage('The name field is required')
    .bail()
    .isIn(Object.values(Roles))
    .withMessage(`Only allowed ${Object.values(Roles).join(', ')}`)
    .trim()
    .escape(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

export const getRoleReq = [
  param('id')
    .isInt()
    .withMessage('The id param id must be numeric')
    .bail()
    .toInt(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];

export const updateRoleReq = [
  param('id')
    .isInt()
    .withMessage('The id param id must be numeric')
    .bail()
    .toInt(),

  body('name')
    .exists()
    .withMessage('The name field is required')
    .bail()
    .isIn(Object.values(Roles))
    .withMessage(`Only allowed ${Object.values(Roles).join(', ')}`)
    .trim()
    .escape(),
  (req: Request, res: Response, next: NextFunction) => {
    validationHandler(req, res, next);
  },
];
