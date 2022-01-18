const Joi = require('joi');
const environment = require('../../config');

const validateSchema = async () => {
  const envSchema = Joi.object({
    app: Joi.object({
      port: Joi.number().required(),
      host: Joi.string().required(),
    }),
    jwt: Joi.object({
      secret: Joi.string().required(),
    }),
    sendGrid: Joi.object({
      SENDGRID_API_KEY: Joi.string().required(),
      SENDGRID_EMAIL_FROM: Joi.string().required(),
    }),
  });

  await envSchema.validateAsync(environment());
};

module.exports = validateSchema;
