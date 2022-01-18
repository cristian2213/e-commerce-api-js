const environments = require('../../environments');

const getEnvironment = () => {
  // const type = process.env.NODE_ENV;
  // return environments[type];
  return './.env';
};

module.exports = getEnvironment;
