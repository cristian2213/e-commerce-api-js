const { randomBytes } = require('crypto');
const { add } = require('date-fns');

const generateRandomToken = () => {
  const token = randomBytes(22).toString('hex');
  const expirationDate = add(new Date(), { hours: 1 });
  return { token, expirationDate };
};

module.exports = generateRandomToken;
