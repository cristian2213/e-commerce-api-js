const { existsSync } = require('fs');
const { StatusCodes } = require('http-status-codes');
const { errorsHandler } = require('../../../helpers/handlers/errorsHandler');
const UploadTypes = require('../../../helpers/products/productsUploadTypes');
const CSVBulkUpload = require('./CSVBulkUpload');
const XLSXBulkUpload = require('./XLSXBulkUpload');

// STEP 01
const productsBulkUploadValidation = async (req, res) => {
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
  } catch (error) {
    errorsHandler(req, res, error, error.message);
  }
};

// STEP 02
const productsBulkUpload = (req, res) => {
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

const checkFile = (req, res) => {
  const { filePath } = req.body;
  const file = existsSync(filePath);
  if (!file) throw new Error("File doesn't exist");
  return true;
};

module.exports = {
  productsBulkUploadValidation,
  productsBulkUpload,
  checkFile,
};
