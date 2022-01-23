const { randomBytes } = require('crypto');
const { add } = require('date-fns');

/**
 * generateRandomToken()
 * @description Function to generate random token with expiration date
 * @returns [{Object}] [Returns Object with token and expiration date]
 */
const generateRandomToken = () => {
  const token = randomBytes(22).toString('hex');
  const expirationDate = add(new Date(), { hours: 1 });
  return { token, expirationDate };
};

module.exports = generateRandomToken;
