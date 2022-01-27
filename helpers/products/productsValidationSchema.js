const Joi = require('joi');

const productsValidationSchema = () => {
  const validationSchema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(20).max(5000).required(),
    price: Joi.number().integer().positive().required(),
    stock: Joi.number().integer().positive().min(1).required(),
  });
  return validationSchema;
};

module.exports = productsValidationSchema;
