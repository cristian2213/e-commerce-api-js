'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductsCategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // **** N:N IN DB ****
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          // NOTE THIS IS THE REFERENCE TO THE TABLA NAME IN DB
          model: 'Products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          // NOTE THIS IS THE REFERENCE TO THE TABLA NAME IN DB
          model: 'Categories',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      // ****************
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductsCategories');
  },
};
