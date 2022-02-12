const { param, body } = require('express-validator');
const { checkCart } = require('../../../services/v1/carts/carts');
const validationHandler = require('../../../helpers/handlers/validationHandler');
const { checkProduct } = require('../../../services/v1/products/products');

const checkCartIdReq = [
  param('cartId')
    .exists()
    .withMessage('The id param is required')
    .bail()
    .toInt()
    .withMessage('The cartId param is invalid')
    .bail()
    .custom((cartId) => {
      return checkCart(cartId);
    }),
  validationHandler,
];

const checkProductsToAddReq = [
  body('product')
    .exists()
    .withMessage('The products field is required.')
    .bail()
    .isObject()
    .withMessage('The products field must be an object.')
    .bail(),

  body('product.id')
    .exists()
    .withMessage('The id property is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('The id property must be a natural number (1,2,3...).')
    .bail()
    .custom((id) => {
      return checkProduct(id); // Validate product id,
    }),

  body('product.quantity')
    .exists()
    .withMessage('The quantity property is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('The quantity property must be a natural number (1,2,3...).')
    .bail(),
  validationHandler,
];

const checkProductIdReq = [
  param('productId')
    .exists()
    .withMessage('The productId params is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('the productId param must be a natural number (1,2,3...).')
    .bail()
    .toInt()
    .custom((productId) => {
      return checkProduct(productId);
    }),

  validationHandler,
];

module.exports = {
  checkCartIdReq,
  checkProductsToAddReq,
  checkProductIdReq,
};
