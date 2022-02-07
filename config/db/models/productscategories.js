'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductsCategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProductsCategories.belongsTo(models.Product, {
        foreignKey: 'productId',
      });

      ProductsCategories.belongsTo(models.Category, {
        foreignKey: 'categoryId',
      });
    }
  }
  ProductsCategories.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          // NOTE THIS IS THE REFERENCE TO THE MODEL NAME
          model: 'Product',
          key: 'id',
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          // NOTE THIS IS THE REFERENCE TO THE MODEL NAME
          model: 'Category',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'ProductsCategories',
    }
  );
  return ProductsCategories;
};
