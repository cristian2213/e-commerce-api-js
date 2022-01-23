const { join } = require('path');

const rootPath = () => {
  return join(__dirname, '..', '..');
};

module.exports = {
  rootPath,
};
