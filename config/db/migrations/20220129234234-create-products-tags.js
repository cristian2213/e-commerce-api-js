'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductsTags', {
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
          // THIS'S THE REFERENCE TO THE TABLE IN DATABASE
          model: 'Products',
          key: 'id',
        },
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          // THIS'S THE REFERENCE TO THE TABLE IN DATABASE
          model: 'Tags',
          key: 'id',
        },
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
    await queryInterface.dropTable('ProductsTags');
  },
};
