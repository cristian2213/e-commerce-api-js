'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartsProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CartsProducts.belongsTo(models.Product, {
        foreignKey: 'productId',
      });

      CartsProducts.belongsTo(models.Cart, {
        foreignKey: 'cartId',
      });
    }
  }
  CartsProducts.init(
    {
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          // IT MAKES TO REFERENCE TO THE MODEL
          model: 'Cart',
          key: 'id',
        },
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          // IT MAKES TO REFERENCE TO THE MODEL
          model: 'Product',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
    },
    {
      sequelize,
      modelName: 'CartsProducts',
    }
  );
  return CartsProducts;
};
