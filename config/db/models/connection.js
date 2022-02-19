'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Connection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ****** N:1 *******
      Connection.belongsTo(models.User, {
        as: 'user',
      });
      // ******************
    }
  }
  Connection.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      connectionType: {
        type: DataTypes.ENUM('connected', 'disconnected'),
        allowNull: false,
        validate: {
          isIn: [['connected', 'disconnected']],
        },
      },
    },
    {
      sequelize,
      modelName: 'Connection',
      createdAt: false,
      updatedAt: false,
    }
  );
  return Connection;
};
