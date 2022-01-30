'use strict';
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

    // const tags = [
    //   'fashion',
    //   'men',
    //   'jacket',
    //   'top',
    //   'book',
    //   'accessories',
    //   'kids',
    //   'pet',
    //   'cosmetics',
    // ].map((tag) => {
    //   return { name: tag };
    // });
    const tags = [];
    for (let i = 0; i < 10; i++) {
      tags.push({ name: faker.random.word() });
    }
    return await queryInterface.bulkInsert('Tags', tags);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return await queryInterface.bulkDelete('Tags', null, {});
  },
};
