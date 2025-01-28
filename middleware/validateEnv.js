// utils/validateEnv.js
const Joi = require('joi');

const validateEnv = () => {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').required(),
    PORT: Joi.number().default(5000),
    DB_HOST: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().allow(''),
    DB_NAME: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
  });

  const { error } = schema.validate(process.env, { allowUnknown: true, abortEarly: false });
  if (error) {
    console.error('Environment variable validation failed:', error.details.map(e => e.message).join(', '));
    process.exit(1);
  }
};

module.exports = validateEnv;
