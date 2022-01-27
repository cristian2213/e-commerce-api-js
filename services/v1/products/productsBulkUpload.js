const { existsSync } = require('fs');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const { errorsHandler } = require('../../../helpers/handlers/errorsHandler');
const UploadTypes = require('../../../helpers/products/productsUploadTypes');
const { validateCSVFile, readCSVFile } = require('./CSVBulkUpload');
const { validateXLSXFile } = require('./XLSXBulkUpload');

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
        validateCSVFile(req, res);
        break;

      case uploadingType === UploadTypes.XLSXFILE:
        validateXLSXFile(req, res);
        break;

      case uploadingType === UploadTypes.TXTFILE:
        break;

      default:
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: ReasonPhrases.BAD_REQUEST,
          msg: `Only allowed these uploading types (${Object.values(
            UploadTypes
          ).join(', ')})`,
        });
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
        readCSVFile(req, res);
        break;

      case uploadingType === UploadTypes.XLSXFILE:
        readXLSXFile(req, res);
        break;

      case uploadingType === UploadTypes.TXTFILE:
        break;

      default:
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: ReasonPhrases.BAD_REQUEST,
          msg: `Only allowed these uploading types (${Object.values(
            UploadTypes
          ).join(', ')})`,
        });
    }
  } catch (error) {
    errorsHandler(req, res, error);
  }
};

module.exports = {
  productsBulkUploadValidation,
  productsBulkUpload,
};
