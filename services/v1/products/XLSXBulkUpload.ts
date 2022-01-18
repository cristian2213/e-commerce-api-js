import { errorsHandler } from './../../../helpers/v1/handlers/errorsHandler';
import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import XLSX from 'xlsx';
import fieldsForCreatingProduct from '../../../helpers/v1/products/fieldsForCreatingProduct';
import productsBulkUpload from './productsBulkUpload';
import ProductsBulkUploadService from './productsBulkUpload';
import { XLSXFileProductsBulkUpload } from '../../../types/v1/products/CSVFileBulkUpload';
import validator from 'validator';
import Product from '../../../models/v1/products/product';
import productsValidationSchema from '../../../helpers/v1/products/productsValidationSchema';
import CSVBulkUpload from './CSVBulkUpload';

// 01 HEADERS VALIDATE
const validateXLSXFile = (req: Request, res: Response) => {
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

  const workbook = XLSX.readFile(file.path);
  const firstSheet = workbook.SheetNames[0]; // return sheet name 🧾
  const worksheet = workbook.Sheets[firstSheet]; // return work sheet
  const columns = worksheet['!ref'];

  const badRequestMsg = {
    statusCode: StatusCodes.BAD_REQUEST,
    message: "File doesn't have content.",
    filePath: file.path,
  };

  if (!columns) return res.status(StatusCodes.BAD_REQUEST).json(badRequestMsg);

  const lastColumn = columns.trim().split(':')[1]; // A1:E10 => ['A1', 'E10']
  if (lastColumn === undefined)
    return res.status(StatusCodes.BAD_REQUEST).json({
      ...badRequestMsg,
      message:
        'The file must have more than one column, please check it and try again.',
    });

  // if lastColumn.length > 3 = lastColumn > Column(X)
  if (lastColumn.length > 3)
    return res.status(StatusCodes.BAD_REQUEST).json({
      ...badRequestMsg,
      message: 'The column limit per file should be 26 from column A to Z.',
    });

  const row = 1;
  const headers = [];
  // get letters from A to Z
  for (let i = 65; i <= 90; i++) {
    const coordinates = String.fromCharCode(i) + row;
    const cellData = worksheet[coordinates];
    if (cellData === undefined) continue;
    headers.push({ value: cellData.v, coordinates });
  }
  // Function for immutability
  const requiredFields = fieldsForCreatingProduct();

  return res.json({
    requiredFields, // labels for form
    headerOptions: headers, // Options for each tag
    filePath: file.path, // Reference to the file
  });
};

// 02 READ FILE
const readXLSXFile = (req: Request, res: Response) => {
  const { filePath, userId } = req.body;

  // Custom validation
  try {
    productsBulkUpload.checkFile(req, res);
  } catch (error: any) {
    return res.status(StatusCodes.NOT_FOUND).json({
      statusCode: ReasonPhrases.NOT_FOUND,
      message: error.message,
    });
  }

  try {
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.SheetNames[0];
    const workSheet = workbook.Sheets[firstSheet];

    const columns = workSheet['!ref'] as string;
    const lastColumn = columns.trim().split(':')[1] as string; // A1:E10 => ['A1', 'E10']

    const { productData: column } = req.body;
    const records = lastColumn.match(/\d+/g) as string[];
    const totalRecords = +records[0];
    const products = [] as XLSXFileProductsBulkUpload[];

    // Get needed data for creating a product according to the coordinate
    for (let row = 2; row <= totalRecords; row++) {
      products.push({
        name: workSheet[column.name + row]
          ? validator
              .escape(workSheet[column.name + row].v)
              .trim()
              .toLowerCase()
          : '',

        title: workSheet[column.title + row]
          ? validator
              .escape(workSheet[column.title + row].v)
              .trim()
              .toLowerCase()
          : '',

        description: workSheet[column.description + row]
          ? validator
              .escape(workSheet[column.description + row].v)
              .trim()
              .toLowerCase()
          : '',

        price: workSheet[column.price + row]
          ? typeof workSheet[column.price + row].v === 'number'
            ? workSheet[column.price + row].v
            : 0
          : 0,

        stock: workSheet[column.stock + row]
          ? typeof workSheet[column.stock + row].v === 'number'
            ? workSheet[column.stock + row].v
            : 0
          : 0,
      });
    }

    req.body.products = products;
    XLSXFileProductsValidate(req, res);
  } catch (error: any) {
    errorsHandler(req, res, error);
  }
};

// 03 VALIDATE PRODUCT DATA
const XLSXFileProductsValidate = async (req: Request, res: Response) => {
  const { userId, products } = req.body;

  let position = 1;
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
      const validationSchema = productsValidationSchema();

      const product = await validationSchema.validateAsync(products[i]);
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

  // 04 MAKE BULK UPLOAD
  CSVBulkUpload.ProductsUpload(req, res);
};

export default {
  validateXLSXFile,
  readXLSXFile,
};
