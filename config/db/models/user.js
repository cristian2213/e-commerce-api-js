'use strict';
const { Model } = require('sequelize');
const argon2 = require('argon2');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ******** 1:1 ********
      User.hasOne(models.Cart, {
        foreignKey: 'userId',
        as: 'cart',
      });
      // *********************

      // ******** 1:N ********
      User.hasMany(models.Role, {
        // The foreing key should be provided here, on the contrary the model with the fk will returns two FKs
        foreignKey: 'userId', // Name in the table with the FK
        as: 'roles',
      });
      User.hasMany(models.Product, {
        foreignKey: 'userId',
        as: 'products',
      });
      User.hasMany(models.Log, {
        foreignKey: 'userId',
        as: 'logs',
      });
      User.hasMany(models.Connection, {
        foreignKey: 'userId',
        as: 'connections',
      });
      // *********************
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [2, 255],
            msg: 'Allowed name length 2 to 255 characters',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Please, add a valid email',
          },
          max: {
            args: [60],
            msg: 'Only allow 60 characters',
          },
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'The password is required',
          },
          len: {
            args: [8, 150],
            msg: 'Allowed password length 8 to 60 characters',
          },
        },
      },

      emailVerifiedAt: {
        type: DataTypes.DATE,
        validate: {
          notNull: false,
        },
      },
      token: {
        type: DataTypes.STRING,
        validate: {
          notNull: false,
        },
      },
      tokenExpiration: {
        type: DataTypes.DATE,
        validate: {
          notNull: false,
        },
      },
    },
    {
      hooks: {
        async beforeCreate(user) {
          const hash = await argon2.hash(user.password);
          user.password = hash;
        },
      },
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
