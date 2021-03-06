const csv = require('csv-parser');
const validator = require('validator');
const { createReadStream } = require('fs');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const db = require('../../../config/db/models/index');
const { Product } = require('../../../config/db/models/index');
const productsValidationSchema = require('../../../helpers/products/productsValidationSchema');
const fieldsForCreatingProduct = require('../../../helpers/products/fieldsForCreatingProduct');
const findFile = require('../../../helpers/files/findFile');

const { createLog } = require('../logs/productsLogs/bulkUploadLog');

// STEP 01
const validateCSVFile = (req, res) => {
  const file = req.file;
  try {
    findFile(file.path);
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({
      statusCode: ReasonPhrases.NOT_FOUND,
      onmessage: error.message,
    });
  }

  const reader = createReadStream(file.path, {
    encoding: 'utf-8',
  });

  reader
    .pipe(
      csv({
        mapHeaders: ({ header }) => header.toLowerCase().trim(),
      })
    )
    .on('headers', (headers) => {
      if (headers.length === 0 || headers[0] === '') {
        // NOTE Delete file uploaded

        return res.status(StatusCodes.BAD_REQUEST).json({
          statusCode: ReasonPhrases.BAD_REQUEST,
          message: "File doesn't have content",
          filePath: file.path,
        });
      }

      const requiredFields = fieldsForCreatingProduct();

      return res.status(StatusCodes.OK).json({
        requiredFields,
        headerOptions: headers,
        filePath: file.path,
      });
    })
    .on('error', (err) => {
      const message =
        err.message.length > 150 ? err.message.substring(0, 150) : err.message;
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ statusCode: StatusCodes.BAD_REQUEST, message });
    });
};

// STEP 02
const readCSVFile = (req, res) => {
  const { filePath } = req.body;

  try {
    findFile(filePath);
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({
      statusCode: ReasonPhrases.NOT_FOUND,
      message: error.message,
    });
  }

  const reader = createReadStream(filePath, {
    encoding: 'utf-8',
  });

  const data = [];

  reader
    .pipe(
      // THE DATA IS DELIVERED USING THE PIPE TO CONNECT WITH THE FUNCTION CSV THAT TO THE END IT'S GONNA PARSE THE COMING DATA.
      csv({
        mapHeaders: ({ header }) => {
          return validator.escape(header).trim().toLowerCase();
        },

        mapValues: ({ header, value }) => {
          const column = header.toLowerCase();
          const sanitizeValue = validator.escape(value).trim().toLowerCase();
          if (column === 'price' || column === 'stock')
            return parseInt(sanitizeValue);
          return sanitizeValue;
        },
      })
    )
    .on('data', (product) => {
      data.push(product);
    })
    .on('end', () => {
      req.body.products = data;
      CSVFileProductsValidate(req, res);
    })
    .on('error', (err) => {
      const message =
        err.message.length > 150 ? err.message.substring(0, 150) : err.message;
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ statusCode: StatusCodes.BAD_REQUEST, message });
    });
};

// STEP 03
const CSVFileProductsValidate = async (req, res) => {
  const { products, productData: matchColumns, userId } = req.body;

  let position = 1;
  const lastPosition = await Product.max('position', {
    where: {
      userId,
    },
  });

  if (lastPosition) position += lastPosition;

  const successfulUploads = [];
  const failedUploads = [];
  const totalProducts = products.length;
  for (let i = 0; i < totalProducts; i++) {
    try {
      const alignKeys = {
        name: products[i][matchColumns.name],
        title: products[i][matchColumns.title],
        description: products[i][matchColumns.description],
        price: products[i][matchColumns.price],
        stock: products[i][matchColumns.stock],
      };

      // Function for immutability
      const validationSchema = productsValidationSchema();

      const product = await validationSchema.validateAsync(alignKeys);

      product['position'] = position;
      product['userId'] = userId;

      successfulUploads.push(product);
      position++;
    } catch (error) {
      const {
        message,
        path,
        context: { value },
      } = error.details[0];
      const errorObject = {
        productRow: i + 2,
        column: path[0],
        value,
        message,
      };
      failedUploads.push(errorObject);
    }
  }

  req.body.validation = { failedUploads, successfulUploads };
  productsUpload(req, res);
};

// STEP 04
const productsUpload = async (req, res) => {
  const { failedUploads, successfulUploads } = req.body.validation;

  const message =
    'There are no valid products to upload, please check your error log.';
  let resMsg = {
    successfulUploads: successfulUploads.length,
    failedUploads: failedUploads.length,
    message,
  };

  if (successfulUploads.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ ...resMsg });
  }

  let transaction;
  let successfulTransation = true;
  try {
    transaction = await db.sequelize.transaction();
    await Product.bulkCreate(successfulUploads, {
      transaction,
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    successfulTransation = false;
  } finally {
    const log = await createLog(req, res);
    const logId = log instanceof Error ? null : log.id;
    const logMessage = logId ? 'Created!' : 'Not created!';

    if (!successfulTransation)
      return res.status(StatusCodes.BAD_REQUEST).json({
        successfulUploads: 0,
        failedUploads: resMsg.successfulUploads + resMsg.failedUploads,
        message: resMsg.message,
        log: {
          logId,
          message: logMessage,
        },
      });

    return res.status(StatusCodes.OK).json({
      ...resMsg,
      message: 'Ok',
      log: {
        logId,
        message: logMessage,
      },
    });
  }
};

module.exports = {
  validateCSVFile,
  readCSVFile,
  productsUpload,
};
