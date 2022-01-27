const multer = require('multer');
const { randomBytes } = require('crypto');
const { existsSync, mkdirSync } = require('fs');

const fileStorage = (path) => {
  const fileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      try {
        const pathExists = existsSync(path);
        if (!pathExists) {
          mkdirSync(path, { recursive: true });
        }
        cb(null, path);
      } catch (error) {
        cb(new Error(error.message), path);
      }
    },

    filename: (_req, file, cb) => {
      const randomName = randomBytes(10).toString('hex');
      cb(null, `${randomName}-${file.originalname}`);
    },
  });
  return fileStorage;
};

const fileFilter = (_req, file, cb) => {
  // {
  //   fieldname: 'productsFile',
  //   originalname: 'theory-lectures-v2-SMALLER_compressed.pdf',
  //   encoding: '7bit',
  //   mimetype: 'application/pdf'
  // }
  if (!file.originalname.match(/\.(csv|xlsx)$/)) return cb(null, false);

  cb(null, true);
};

const multerOptions = (path) => {
  const options = {
    limits: {
      files: 1,
      fieldSize: 100000000,
    },
    storage: fileStorage(path),
    fileFilter: fileFilter,
  };
  return options;
};

module.exports = {
  multerOptions,
};
