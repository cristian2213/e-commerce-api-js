const { randomBytes } = require('crypto');

const generateRandomString = (length = 12) => {
  return randomBytes(length).toString('hex');
};

module.exports = generateRandomString;
