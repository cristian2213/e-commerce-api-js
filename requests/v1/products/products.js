const { body, param } = require('express-validator');
const validationHandler = require('../../../helpers/handlers/validationHandler');
const { checkUser } = require('../../../services/v1/users/users');

const createProductReq = [
  body('name')
    .exists()
    .withMessage('The name field is required')
    .bail()
    .isString()
    .withMessage('The name field must be and string')
    .bail()
    .isLength({ min: 5, max: 255 })
    .withMessage('The length of the name must be 5 to 255 characters')
    .bail()
    .trim()
    .escape(),

  body('title')
    .exists()
    .withMessage('The title field is required')
    .bail()
    .isString()
    .withMessage('The title field must be and string')
    .bail()
    .isLength({ min: 5, max: 255 })
    .withMessage('The length of the title must be 5 to 255 characters')
    .bail()
    .trim()
    .escape(),

  body('description')
    .exists()
    .withMessage('The description field is required')
    .bail()
    .isString()
    .withMessage('The description field must be a string')
    .bail()
    .isLength({ min: 20, max: 5000 })
    .withMessage('The length of the description must be 20 to 5000 characters')
    .bail()
    .trim()
    .escape(),

  body('price')
    .exists()
    .withMessage('The price field is required')
    .bail()
    .isDecimal({ decimal_digits: '2' })
    .withMessage('The price field must be a decimal number with 2 decimals')
    .bail()
    .escape(),

  body('slug')
    .exists()
    .withMessage('The slug field is required')
    .bail()
    .isString()
    .withMessage('The slug field must be a string')
    .bail()
    .isLength([{ min: 5, max: 255 }])
    .withMessage('The length of the slug must be 5 to 255 characters')
    .bail()
    .escape()
    .trim()
    .toLowerCase(),

  body('stock')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('The stock field must be a positive number')
    .bail()
    .escape()
    .toInt(),

  body('likes')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('The likes field must be a positive number')
    .bail()
    .toInt(),

  body('userId')
    .exists()
    .withMessage('The userId field is required')
    .bail()
    .isInt()
    .withMessage('The userId field must be a number')
    .bail()
    .custom(async (userId) => {
      return checkUser(userId);
    }),

  (req, res, next) => {
    validationHandler(req, res, next);
  },
];

const updateProductReq = [
  body('name')
    .optional({ nullable: true })
    .isString()
    .withMessage('The name field must be and string')
    .bail()
    .isLength({ min: 5, max: 255 })
    .withMessage('The length of the name must be 5 to 255 characters')
    .bail()
    .trim()
    .escape(),

  body('title')
    .optional({ nullable: true })
    .isString()
    .withMessage('The title field must be and string')
    .bail()
    .isLength({ min: 5, max: 255 })
    .withMessage('The length of the title must be 5 to 255 characters')
    .bail()
    .trim()
    .escape(),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('The description field must be a string')
    .bail()
    .isLength({ min: 20, max: 5000 })
    .withMessage('The length of the description must be 20 to 5000 characters')
    .bail()
    .trim()
    .escape(),

  body('price')
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: '2' })
    .withMessage('The price field must be a decimal number with 2 decimals')
    .bail()
    .escape(),

  body('slug')
    .optional({ nullable: true })
    .isString()
    .withMessage('The slug field must be a string')
    .bail()
    .isLength([{ min: 5, max: 255 }])
    .withMessage('The length of the slug must be 5 to 255 characters')
    .bail()
    .escape()
    .trim()
    .toLowerCase(),

  body('stock')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('The stock field must be a positive number')
    .bail()
    .toInt(),

  body('likes')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('The likes field must be a positive number')
    .bail()
    .toInt(),

  body('userId')
    .exists()
    .withMessage('The userId field is required')
    .bail()
    .isInt()
    .withMessage('The userId field must be a number')
    .bail()
    .custom(async (userId) => {
      return checkUser(userId);
    }),

  (req, res, next) => {
    validationHandler(req, res, next);
  },
];

const getProductReq = [
  param('slug')
    .isSlug()
    .withMessage('The slug param is invalid')
    .bail()
    .trim()
    .escape(),

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

const getProductsReq = [
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

const bulkUploadReq = [
  body('productData')
    .exists()
    .withMessage('The productData field is required')
    .bail()
    .isObject()
    .withMessage('The productData field must be an object')
    .bail(),

  body('productData.name')
    .exists()
    .withMessage('The name field is required')
    .bail()
    .isString()
    .withMessage('The name field must be a string')
    .bail()
    .trim()
    .escape(),

  body('productData.title')
    .exists()
    .withMessage('The title field is required')
    .bail()
    .isString()
    .withMessage('The title field must be a string')
    .bail()
    .trim()
    .escape(),

  body('productData.description')
    .exists()
    .withMessage('The description field is required')
    .bail()
    .isString()
    .withMessage('The description field must be a string')
    .bail()
    .trim()
    .escape(),

  body('productData.price')
    .exists()
    .withMessage('The price field is required')
    .bail()
    .isString()
    .withMessage('The price field must be a string')
    .bail()
    .trim()
    .escape(),

  body('productData.stock')
    .exists()
    .withMessage('The stock field is required')
    .bail()
    .isString()
    .withMessage('The stock field must be a string')
    .bail()
    .trim()
    .escape(),

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

module.exports = {
  createProductReq,
  updateProductReq,
  getProductReq,
  getProductsReq,
  bulkUploadReq,
};
