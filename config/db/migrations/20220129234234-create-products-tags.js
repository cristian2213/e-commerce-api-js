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
          // THIS'S THE REFERENCE TO THE TABLE IN DB
          model: 'Products',
          key: 'id',
        },
        // NOTE WHEN THE ID IN THE PRODUCT TABLE IS DELETED IT'S GONNA DELETE THIS RECORD TOO
        onDelete: 'CASCADE',
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          // THIS'S THE REFERENCE TO THE TABLE IN DB
          model: 'Tags',
          key: 'id',
        },
        // NOTE WHEN THE ID IN THE PRODUCT TABLE IS DELETED IT'S GONNA DELETE THIS RECORD TOO
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
    await queryInterface.dropTable('ProductsTags');
  },
};
