'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER({ unsigned: true }),
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      stock: {
        type: Sequelize.SMALLINT({ unsigned: true }),
        allowNull: true,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 1,
      },
      likes: {
        type: Sequelize.SMALLINT({ unsigned: true }),
        allowNull: true,
        defaultValue: 0,
      },
      position: {
        type: Sequelize.SMALLINT({ unsigned: true }),
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          // NOTE THIS IS THE REFERENCE TO THE NAME TABLE
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  },
};
