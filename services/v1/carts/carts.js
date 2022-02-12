const errorsHandler = require('../../../helpers/handlers/errorsHandler');
const { Cart, Product, User } = require('../../../config/db/models/index');
const { StatusCodes } = require('http-status-codes');

// REVIEW, THIS IS THE RIGHT WAY TO DEFINE FUNCTIONS, BECAUSE THIS LETS US SEE THE NAME OF THE FUNCTION WHEN WE'RE DEBUGGING OUR CODE.

async function getCart(req, res) {
  const { sub } = req.user;
  try {
    const cart = await getCartWithProducts(sub);
    return res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    errorsHandler(req, res, error);
  }
}

async function addProductsToCart(req, res) {
  const { sub: userId } = req.user;
  const { product } = req.body;

  try {
    const user = await User.findByPk(userId);
    const cart = await user.getCart();

    // REVIEW IT ONLY RETURNS ONE PRODUCT IF THAT PRODUCT HAS ASSOCIATIONS WITH THE CARTS_PRODUTS PIVOT TABLE
    const products = await cart.getProducts({
      // BY DEFAULT IT RETURNS THE PIVOT TABLE
      attributes: ['id'],
      where: {
        id: product.id,
      },
    });

    let productExists;
    if (products.length > 0) {
      productExists = products[0];
    }

    if (!productExists) {
      await cart.addProduct(product.id, {
        through: { quantity: product.quantity },
      });
    } else {
      const newQuantity =
        productExists.CartsProducts.quantity + product.quantity;
      // TO UPDATE THE PRODUCT EXISTS
      await cart.addProduct(productExists, {
        through: { quantity: newQuantity },
      });
    }

    const updatedCart = await cart.getProducts({
      attributes: [],
    });

    return res.status(StatusCodes.OK).json({ cart: updatedCart });
  } catch (error) {
    errorsHandler(req, res, error);
  }
}

async function deleteCartProducts(req, res) {
  const { sub: userId } = req.user;
  const { productId } = req.params;
  try {
    const user = await User.findByPk(userId);
    const cart = await user.getCart();
    const products = await cart.getProducts({
      where: {
        id: productId,
      },
    });

    if (products.length === 0)
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        message: `The product #${productId} hasn't been added to the cart yet.`,
      });
    else {
      await products[0].CartsProducts.destroy();
    }

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: 'Product deleted from cart.',
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
}

async function getCartWithProducts(userId) {
  const cart = await Cart.findOne({
    include: [
      {
        model: Product,
        as: 'products',
        require: true,
      },
    ],
    where: {
      userId,
    },
  });
  return cart ? cart : false;
}

async function checkCart(cartId) {
  const cart = await Cart.findByPk(cartId);
  if (!cart) throw new Error(`Cart #${cartId} doesn't exist.`);
  return true;
}

module.exports = {
  getCart,
  addProductsToCart,
  deleteCartProducts,
  checkCart,
};
