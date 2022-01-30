'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ****** N:N *******
      Tag.belongsToMany(models.Product, {
        through: 'ProductsTags',
        foreignKey: 'tagId',
        as: 'products',
      });
      // ******************
    }
  }
  Tag.init(
    {
      name: {
        type: DataTypes.STRING(40),
        unique: true,
        allowNull: false,
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
      modelName: 'Tag',
    }
  );
  return Tag;
};
