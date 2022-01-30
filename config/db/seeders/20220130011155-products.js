'use strict';
const { getLastPosition } = require('../../../services/v1/products/products');
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    let lastPosition = await getLastPosition();
    const products = [];
    for (let i = 0; i < 10; i++) {
      const name = faker.commerce.productName();
      products.push({
        name,
        description: faker.commerce.productDescription(),
        title: `${name} #${lastPosition}`,
        price: faker.finance.amount(10000, 1000000, 2),
        slug: faker.random.uuid(),
        stock: Math.round(Math.random() * 100),
        likes: Math.round(Math.random() * 10),
        position: lastPosition,
        userId: 1, // admin by defaul
      });
      lastPosition++;
    }
    return await queryInterface.bulkInsert('Products', products);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return await queryInterface.bulkDelete('Products', null, {});
  },
};
