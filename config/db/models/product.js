'use strict';
const { Model } = require('sequelize');
const generateSlug = require('../../../helpers/products/generateSlug');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ****** N:1 RELATIONSHIP *******
      Product.belongsTo(models.User, {
        as: 'user',
      });
      // ********************************

      // ****** N:N RELATIONSHIP *******
      Product.belongsToMany(models.Tag, {
        through: 'ProductsTags',
        foreignKey: 'productId',
        as: 'tags',
      });

      Product.belongsToMany(models.Category, {
        through: 'ProductsCategories',
        foreignKey: 'productId',
        as: 'categories',
      });

      Product.belongsToMany(models.Cart, {
        foreignKey: 'productId',
        through: 'CartsProducts',
        as: 'carts',
      });
      // ********************************
    }
  }
  Product.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [5, 255],
            msg: 'Allowed length minimum 5 and maximum 255 characters',
          },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [5, 255],
            msg: 'Allowed length minimum 5 and maximum 255 characters',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: {
            args: [20, 255],
            msg: 'Allowed length minimum 20 and maximum 255 characters',
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          isDecimal: true,
        },
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [5, 255],
            msg: 'Allowed length minimum 5 and maximum 255 characters',
          },
          async isUnique(slug) {
            const product = await Product.findOne({
              where: {
                slug: slug,
              },
            });

            if (product) throw new Error('The slug field exists already');
          },
        },
      },
      stock: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        validate: {
          isInt: true,
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        validate: {
          isIn: [[true, false]],
        },
      },
      likes: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        validate: {
          isInt: true,
        },
      },
      position: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          // NOTE THIS IS THE REFERENCE TO THE MODEL
          model: 'User',
          key: 'id',
        },
      },
    },
    {
      hooks: {
        beforeBulkCreate: (products) => {
          for (let i = 0; i < products.length; i++) {
            products[i].slug = generateSlug(products[i].name);
          }
        },
      },
      sequelize,
      modelName: 'Product',
    }
  );
  return Product;
};
