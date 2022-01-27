const { existsSync } = require('fs');

const findFile = (filePath) => {
  const file = existsSync(filePath);
  if (!file) throw new Error("File doesn't exist");
  return true;
};

module.exports = findFile;
