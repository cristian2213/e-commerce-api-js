const { Op } = require('sequelize');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const errorsHandler = require('../../../helpers/handlers/errorsHandler');
const {
  Product,
  Category,
  User,
  Role,
  Tag,
} = require('../../../config/db/models/index');
const generateSlug = require('../../../helpers/products/generateSlug');

const createProduct = async (req, res) => {
  try {
    const { userId, tags: TagIDs, categories: categoriesIDs } = req.body;
    let position = 1;
    const lastPosition = await Product.max('position', {
      where: {
        userId,
      },
    });

    if (lastPosition) position += lastPosition;

    req.body.position = position;
    req.body.slug = generateSlug(req.body.slug);

    // CREATE PRODUCT
    const product = await Product.create({
      ...req.body,
    });
    await product.reload();

    const [tags, categories] = await Promise.all([
      addTagsToProduct(product, TagIDs),
      addCategoriesToProduct(product, categoriesIDs),
    ]);

    return res.status(StatusCodes.CREATED).json({ product, tags, categories });
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
      attributes: [
        'id',
        'name',
        'title',
        'description',
        'price',
        'slug',
        'stock',
        'likes',
        'position',
      ],
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
          require: true,
          through: {
            // NOTE WITHOUT PIVOT TABLE
            attributes: [],
          },
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          require: true,
          through: {
            // NOTE WITHOUT PIVOT TABLE
            attributes: [],
          },
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'emailVerifiedAt'],
          require: true, // From OUTER JOIN to an INNER JOIN
          include: [
            {
              model: Role,
              as: 'roles',
              attributes: ['id', 'name'],
              require: true,
            },
          ],
        },
      ],
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
    const { userId, likes, slug: newSLug, categories, tags } = req.body;
    const product = await Product.findOne({
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id'],
          through: {
            // NOTE WITHOUT PIVOT TABLE
            attributes: [],
          },
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id'],
          through: {
            // NOTE WITHOUT PIVOT TABLE
            attributes: [],
          },
        },
      ],
      where: { slug, userId },
    });

    if (!product)
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND,
      });
    if (likes) req.body.likes += product.likes;

    if (newSLug) req.body.slug = generateSlug(newSLug);

    if (categories && tags)
      await Promise.all([
        deleteCategoriesFromProduct(product, product.categories),
        deleteTagsFromProduct(product, product.tags),
        addCategoriesToProduct(product, categories),
        addTagsToProduct(product, tags),
      ]);

    if (categories) {
      await deleteCategoriesFromProduct(product, product.categories),
        await addCategoriesToProduct(product, categories);
    }

    if (tags) {
      await deleteTagsFromProduct(product, product.tags);
      await addTagsToProduct(product, tags);
    }

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

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @description Helper function to get the last position of a product
 * @returns [{Object|number}] [Returns an Object with the property 'position' | Returns the number '0'];
 */
const getLastPosition = async (req, res) => {
  const lastPosition = await Product.max('position', {
    where: {
      userId: 1,
    },
  });
  return lastPosition ? lastPosition : 0;
};

/**
 *
 * @param {Product} prodcutIntance - Instance of Product
 * @param {Array} tags - Tags to adding to one product
 * @description Function to add tags to one product using Special methods created by Sequelize
 * @returns [{ProductTags[]}] [Returns an Array of ProductsTags]
 */
const addTagsToProduct = async (prodcutIntance, tagIDs) => {
  const tags = await prodcutIntance.addTags(tagIDs);
  return tags;
};

/**
 *
 * @param {Product} productInstance - Instance of Product
 * @param {Array} categoryIDs - Categories to associte with one product
 * @description Function to add categories to one product using Special methods created by Sequelize
 * @returns [{ProductsCategories[]}] [Returns an Array of ProductsCategories]
 */
const addCategoriesToProduct = async (productInstance, categoryIDs) => {
  const categories = await productInstance.addCategories(categoryIDs);
  return categories;
};
/**
 *
 * @param {Product} productInstance - Instance of Product
 * @param {Array} categoryIDs - Categories to associte with one product
 * @description Function to delete categories to one product using Special methods created by Sequelize
 * @returns [{undefined}] [void]
 */
async function deleteCategoriesFromProduct(productInstance, categoryIDs) {
  await productInstance.removeCategories(categoryIDs);
}

/**
 *
 * @param {Product} prodcutIntance - Instance of Product
 * @param {Array} tagsIDs - Tags id to add to one product
 * @description Function to delete tags to one product using Special methods created by Sequelize
 * @returns [{undefined}] [void]
 */
async function deleteTagsFromProduct(productInstance, tagsIDs) {
  await productInstance.removeTags(tagsIDs);
}

async function checkProduct(productId) {
  const product = await Product.findByPk(productId);

  // TO VALIDATE MORE THAN ONE PRODUCT BY ID
  // if (products.length < productsIDs.length) {
  //   const productsId = productsIDs.map((product) => product.id);
  //   const noProducts = productsIDs.filter((id) => {
  //     if (!productsId.include(id)) return id;
  //   });
  //   throw new Error(
  //     `Some products do not exist, products found ${productsIDs.join(
  //       ', '
  //     )}, products without results ${noProducts.join(', ')}`
  //   );
  // }

  if (!product) throw new Error(`The product #${productId} doesn't exist`);
  return true;
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductPosition,
  getLastPosition,
  checkProduct,
};
