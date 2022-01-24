const { Op } = require('sequelize');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const errorsHandler = require('../../../helpers/handlers/errorsHandler');
const { Product } = require('../../../config/db/models/index');
const generateSlug = require('../../../helpers/products/generateSlug');

const createProduct = async (req, res) => {
  try {
    const { userId } = req.body;
    let position = 1;
    const lastPosition = await Product.max('position', {
      where: {
        userId,
      },
    });

    if (lastPosition) position += lastPosition;

    req.body.position = position;
    req.body.slug = generateSlug(req.body.slug);

    const product = await Product.create(
      {
        ...req.body,
      },
      {}
    );
    await product.reload();
    return res.status(StatusCodes.CREATED).json(product);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const getProducts = async (req, res) => {
  try {
    let { limit, offset } = req.query;
    const { userId } = req.body;
    const limitByDefault = 10;
    const offsetByDefault = 0;

    const where = {
      userId,
    };

    const totalProducts = await Product.count({ where });
    const products = await Product.findAll({
      where,
      order: [['position', 'ASC']],
      limit: limit ? +limit : limitByDefault,
      offset: offset ? +offset : offsetByDefault,
    });

    return res.status(StatusCodes.OK).json({
      products,
      totalProducts,
      limit: limit ? +limit : limitByDefault,
      offset: offset ? +offset : offsetByDefault,
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId } = req.body;
    const product = await Product.findOne({
      // include: Tag,
      where: {
        slug,
        userId,
      },
    });
    if (!product)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND,
      });

    return res.status(StatusCodes.OK).json(product);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId, likes, slug: newSLug } = req.body;
    const product = await Product.findOne({ where: { slug, userId } });
    if (!product)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND,
      });
    if (likes) req.body.likes += product.likes;

    if (newSLug) req.body.slug = generateSlug(newSLug);

    const updatedProduct = await product.update(req.body);
    await updatedProduct.reload();
    return res.status(StatusCodes.OK).json(updatedProduct);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const updateProductPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const product = await Product.findOne({ where: { id, userId } });
    if (!product)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND,
      });

    req.body.product = product;
    const newPosition = req.body.position;
    const currentPosition = product.position;
    let msg = 'Position successfully updated';

    switch (true) {
      // Permutation #1
      case newPosition > currentPosition:
        await updateRightPosition(req, res, newPosition, currentPosition);
        break;

      // Permutation #2
      case newPosition < currentPosition:
        await updateLeftPosition(req, res, newPosition, currentPosition);
        break;

      // Permutation #3
      case newPosition === currentPosition:
        msg =
          'The product current position can not be updated because of the new position is the same';
        break;
    }

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: msg,
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/*
* [nodo1, nodo2, nodo3, nodo4, nodo5] => 1 to 5 = [nodo2, nodo3, nodo4, nodo5, nodo1]
                                                    1       2      3      4      5
*/
const updateRightPosition = async (req, res, newPosition, currentPosition) => {
  try {
    const { userId, product } = req.body;
    const maxPosition = await Product.max('position', {
      where: {
        userId,
      },
    });

    if (newPosition > maxPosition) {
      await product.update({ position: maxPosition + 1 });
      return;
    }

    const totalToUpdate = newPosition - currentPosition + 1;
    if (newPosition <= maxPosition) {
      const productsToUpdate = await Product.findAll({
        where: {
          userId,
          position: {
            [Op.gte]: currentPosition,
          },
        },
        order: [['position', 'ASC']],
        limit: totalToUpdate,
      });

      const productsLength = productsToUpdate.length;
      for (let i = 0; i < productsLength; i++) {
        if (i === 0) {
          await productsToUpdate[i].update({ position: newPosition });
          continue;
        }
        await productsToUpdate[i].update({
          position: productsToUpdate[i]['position'] - 1,
        });
      }
    }
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

/*
 *[nodo1, nodo2, nodo3, nodo4, nodo5] => 5 to 1 = [nodo5, nodo1, nodo2, nodo3, nodo4]
                                                    1       2      3      4      5
 */
const updateLeftPosition = async (req, res, newPosition, currentPosition) => {
  try {
    const { userId, product } = req.body;
    // 5 to 1
    const totalToUpdate = currentPosition - newPosition + 1; // (a > b | a - b = +c)

    const productsToUpdate = await Product.findAll({
      where: {
        userId,
        position: {
          [Op.lte]: currentPosition,
        },
      },
      order: [['position', 'DESC']],
      limit: totalToUpdate,
    });

    const totalLength = productsToUpdate.length;
    for (let i = 0; i < totalLength; i++) {
      if (i === 0) {
        await product.update({ position: newPosition });
        continue;
      }

      await productsToUpdate[i].update({
        position: productsToUpdate[i]['position'] + 1,
      });
    }
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId } = req.body; 
    let product = await Product.findOne({ where: { slug, userId } });
    if (!product)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND,
      });

    product = await product.destroy();
    return res.status(StatusCodes.OK).json(product);
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductPosition,
};
