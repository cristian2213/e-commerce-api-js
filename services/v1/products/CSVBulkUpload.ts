import { Request, Response } from 'express';
import csv from 'csv-parser';
import validator from 'validator';
import { createReadStream } from 'fs';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import db from '../../../config/v1/db/databae.config';
import { CSVFileProductsBulkUpload } from '../../../types/v1/products/CSVFileBulkUpload';
import Product from '../../../models/v1/products/product';
import productsValidationSchema from '../../../helpers/v1/products/productsValidationSchema';
import ProductsBulkUploadService from './productsBulkUpload';
import fieldsForCreatingProduct from '../../../helpers/v1/products/fieldsForCreatingProduct';
import ProductsLogService from '../logs/productsLogs/bulkUploadLog';

// STEP 01
const validateCSVFile = (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  req.body.filePath = file.path;
  try {
    ProductsBulkUploadService.checkFile(req, res);
  } catch (error: any) {
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
    .on('headers', (headers: string[]) => {
      if (headers.length === 0 || headers[0] === '') {
        // Delete file uploaded

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
    .on('error', (err: Error) => {
      const message =
        err.message.length > 150 ? err.message.substring(0, 150) : err.message;
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ statusCode: StatusCodes.BAD_REQUEST, message });
    });
};

// STEP 02
const readCSVFile = (req: Request, res: Response) => {
  const { filePath } = req.body;

  try {
    ProductsBulkUploadService.checkFile(req, res);
  } catch (error: any) {
    return res.status(StatusCodes.NOT_FOUND).json({
      statusCode: ReasonPhrases.NOT_FOUND,
      message: error.message,
    });
  }

  const reader = createReadStream(filePath, {
    encoding: 'utf-8',
  });

  const data = [] as CSVFileProductsBulkUpload[];

  reader
    .pipe(
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
    .on('error', (err: Error) => {
      const message =
        err.message.length > 150 ? err.message.substring(0, 150) : err.message;
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ statusCode: StatusCodes.BAD_REQUEST, message });
    });
};

// STEP 03
const CSVFileProductsValidate = async (req: Request, res: Response) => {
  const { products, productData: matchColumns, userId } = req.body;

  let position: number = 1;
  const lastPosition: number = await Product.max('position', {
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
    } catch (error: any) {
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
  ProductsUpload(req, res);
};

// STEP 04
const ProductsUpload = async (req: Request, res: Response) => {
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

  let transaction: any;
  let successfulTransation = true;
  try {
    transaction = await db.transaction();
    await Product.bulkCreate(successfulUploads, {
      transaction,
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    successfulTransation = false;
  } finally {
    const log = await ProductsLogService.createLog(req, res);
    const logId = log instanceof Error ? null : log.id;

    if (!successfulTransation)
      return res.status(StatusCodes.BAD_REQUEST).json({
        successfulUploads: 0,
        failedUploads: resMsg.successfulUploads + resMsg.failedUploads,
        message: resMsg.message,
        log: {
          logId,
          message: 'The log was not created!',
        },
      });

    return res.status(StatusCodes.OK).json({
      ...resMsg,
      message: 'Ok',
      log: {
        logId,
        message: 'Created!',
      },
    });
  }
};

export default {
  validateCSVFile,
  readCSVFile,
  ProductsUpload,
};
