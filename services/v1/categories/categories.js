const { Op } = require('sequelize');
const { Category } = require('../../../config/db/models/index');

const checkCategories = async (categoryIDs) => {
  const categories = await Category.findAll({
    where: {
      id: {
        [Op.in]: categoryIDs,
      },
    },
  });

  if (categories.length < categoryIDs.length)
    throw new Error('Some categories do not exist, please check and try again');
  return true;
};

module.exports = {
  checkCategories,
};
