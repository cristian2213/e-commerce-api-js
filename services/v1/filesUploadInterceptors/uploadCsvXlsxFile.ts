import multer, { DiskStorageOptions, Options } from 'multer';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';

const fileStorage = (path: string) => {
  const fileStorage = multer.diskStorage({
    destination: (_req: Express.Request, _file: Express.Multer.File, cb) => {
      try {
        const pathExists = existsSync(path);
        if (!pathExists) {
          mkdirSync(path, { recursive: true });
        }
        cb(null, path);
      } catch (error: any) {
        cb(new Error(error.message), path);
      }
    },

    filename: (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: CallableFunction
    ) => {
      const randomName = randomBytes(10).toString('hex');
      cb(null, `${randomName}-${file.originalname}`);
    },
  } as DiskStorageOptions);
  return fileStorage;
};

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: CallableFunction
) => {
  // {
  //   fieldname: 'productsFile',
  //   originalname: 'theory-lectures-v2-SMALLER_compressed.pdf',
  //   encoding: '7bit',
  //   mimetype: 'application/pdf'
  // }
  if (!file.originalname.match(/\.(csv|xlsx)$/)) return cb(null, false);

  cb(null, true);
};

const multerOptions = (path: string): Options => {
  const options: Options = {
    limits: {
      files: 1,
      fieldSize: 100000000,
    },
    storage: fileStorage(path),
    fileFilter: fileFilter,
  };
  return options;
};

export default {
  multerOptions,
};
