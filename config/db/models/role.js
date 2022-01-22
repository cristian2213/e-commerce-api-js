'use strict';
const { Model } = require('sequelize');
const { RolesValues } = require('../../../helpers/roles/roles');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // N:1
      Role.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  Role.init(
    {
      name: {
        type: DataTypes.STRING,
        validate: {
          len: {
            msg: [4, 255],
            msg: 'Allowed name length 2 to 255 characters',
          },
          hasRoles(name) {
            if (!RolesValues.includes(name))
              throw new Error(
                `Role didn't allow, Only allowed ${RolesValues.join(', ')}`
              );
          },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'User',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Role',
    }
  );
  return Role;
};
