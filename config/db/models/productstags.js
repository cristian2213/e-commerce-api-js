'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductsTags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ****** N:N *******
      ProductsTags.belongsTo(models.Product, { foreignKey: 'productId' });
      ProductsTags.belongsTo(models.Tag, { foreignKey: 'tagId' });
      // ******************
    }
  }
  ProductsTags.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Product',
          key: 'id',
        },
      },
      tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Tag',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'ProductsTags',
    }
  );
  return ProductsTags;
};
