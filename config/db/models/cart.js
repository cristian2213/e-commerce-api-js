'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ****** 1:1 *******
      Cart.belongsTo(models.User, {
        as: 'user',
      });
      // ******************

      // ****** N:N *******
      Cart.belongsToMany(models.Product, {
        through: 'CartsProducts',
        foreignKey: 'cartId',
        as: 'products',
      });
      // ******************
    }
  }
  Cart.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Cart',
    }
  );
  return Cart;
};
