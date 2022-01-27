const express = require('express');
const router = express.Router();
const multer = require('multer');
const { join } = require('path');
const {
  productsBulkUpload,
  productsBulkUploadValidation,
} = require('../../../services/v1/products/productsBulkUpload');
const {
  multerOptions,
} = require('../../../services/v1/filesUploadInterceptors/uploadCsvXlsxFile');

const {
  getProductsReq,
  getProductReq,
  bulkUploadReq,
  createProductReq,
  updateProductReq,
} = require('../../../requests/v1/products/products');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductPosition,
} = require('../../../services/v1/products/products');

console.log(join(__dirname, '..', '..', '..', 'storage', 'docs', 'products'));

router.get('/get-products', getProductsReq, getProducts);
router.get('/get-product/:slug', getProductReq, getProduct);
router.post('/create-product', createProductReq, createProduct);
router.put(
  '/update-product/:slug',
  getProductReq,
  updateProductReq,
  updateProduct
);
router.delete('/delete-product/:slug', getProductReq, deleteProduct);

router.post(
  '/bulk-upload-validation',
  multer(
    multerOptions(
      join(__dirname, '..', '..', '..', 'storage', 'docs', 'products')
    )
  ).single('productsFile'),
  productsBulkUploadValidation
);

router.post('/bulk-upload', bulkUploadReq, productsBulkUpload);
router.put('/update-position/:id', updateProductPosition);

module.exports = router;
