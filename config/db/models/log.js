'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ****** N:1 *******
      Log.belongsTo(models.User, {
        as: 'user',
      });
      // ******************
    }
  }

  Log.init(
    {
      logType: {
        type: DataTypes.ENUM('product'),
        allowNull: false,
      },
      successfulUploads: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isNumeric: {
            msg: 'The successfulUploads field must be a value of numeric type.',
          },
        },
      },
      failedUploads: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isNumeric: {
            msg: 'The successfulUploads field must be a value of numeric type.',
          },
        },
      },
      errors: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        references: {
          // NOTE THIS IS THE REFERENCE TO THE MODEL
          model: 'User',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Log',
    }
  );
  return Log;
};
