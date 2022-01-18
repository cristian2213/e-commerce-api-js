import { Request, Response } from 'express';
import { existsSync } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { errorsHandler } from '../../../helpers/v1/handlers/errorsHandler';
import UploadTypes from '../../../helpers/v1/products/productsUploadTypes';
import CSVBulkUpload from './CSVBulkUpload';
import XLSXBulkUpload from './XLSXBulkUpload';

// STEP 01
const productsBulkUploadValidation = async (req: Request, res: Response) => {
  const { file } = req;
  if (!file)
    return res.status(StatusCodes.BAD_REQUEST).json({
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'File not allowed, only (.csv) file',
    });
  try {
    const { uploadingType } = req.body;
    switch (true) {
      case uploadingType === UploadTypes.CSVFILE:
        CSVBulkUpload.validateCSVFile(req, res);
        break;

      case uploadingType === UploadTypes.XLSXFILE:
        XLSXBulkUpload.validateXLSXFile(req, res);
        break;

      case uploadingType === UploadTypes.TXTFILE:
        break;
    }
  } catch (error: any) {
    errorsHandler(req, res, error, error.message);
  }
};

// STEP 02
const productsBulkUpload = (req: Request, res: Response) => {
  try {
    const { uploadingType } = req.body;
    switch (true) {
      case uploadingType === UploadTypes.CSVFILE:
        CSVBulkUpload.readCSVFile(req, res);
        break;

      case uploadingType === UploadTypes.XLSXFILE:
        XLSXBulkUpload.readXLSXFile(req, res);
        break;

      case uploadingType === UploadTypes.TXTFILE:
        break;
    }
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

const checkFile = (req: Request, res: Response) => {
  const { filePath } = req.body;
  const file = existsSync(filePath);
  if (!file) throw new Error("File doesn't exist");
  return true;
};

export default {
  productsBulkUploadValidation,
  productsBulkUpload,
  checkFile,
};
