const express = require('express');
const router = express.Router();
const {
  getCart,
  addProductsToCart,
  deleteCartProducts,
} = require('../../../services/v1/carts/carts');
const {
  checkCartIdReq,
  checkProductsToAddReq,
  checkProductIdReq,
} = require('../../../requests/v1/carts/carts');
const verifyToken = require('../../../middlewares/v1/auth/verifyToken');

// REVIEW THIS IS NEW APROACH TO DEFINE ROUTES EASILY

// TO GET PRODUCTS THAT BELONGS TO THE CART
router.get('/:cartId', verifyToken, checkCartIdReq, getCart);

// TO ADD PRODUCTS TO THE CART
router.post('/', verifyToken, checkProductsToAddReq, addProductsToCart);

// TO DELETE CART PRODUCTS
router.delete(
  '/:productId',
  verifyToken,
  checkProductIdReq,
  deleteCartProducts
);

module.exports = router;
