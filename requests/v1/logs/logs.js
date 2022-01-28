const { param, body } = require('express-validator');
const validationHandler = require('../../../helpers/handlers/validationHandler');
const { checkUser } = require('../../../services/v1/users/users');

const getLogReq = [
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
      return checkUser(userId);
    }),

  (req, res, next) => {
    validationHandler(req, res, next);
  },
];

module.exports = { getLogReq };
