'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      logType: {
        type: Sequelize.ENUM('product'),
        allowNull: false,
      },
      successfulUploads: {
        type: Sequelize.INTEGER({ unsigned: true }),
        allowNull: false,
      },
      failedUploads: {
        type: Sequelize.INTEGER({ unsigned: true }),
        allowNull: false,
      },
      errors: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: 0,
      },
      filePath: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          // NOTE THIS IS THE REFERENCE TO THE NAME TABLE
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
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
    await queryInterface.dropTable('Logs');
  },
};
