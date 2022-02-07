'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ****** N:N *******
      Category.belongsToMany(models.Product, {
        through: 'ProductsCategories',
        foreignKey: 'categoryId',
        as: 'products',
      });
      // ******************
    }
  }
  Category.init(
    {
      name: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
        validate: {
          len: {
            args: [2, 40],
            msg: 'The name field must have a minimum length of 20 and a maximum of 40 characters in the database.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Category',
    }
  );
  return Category;
};
