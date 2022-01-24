const express = require('express');
const router = express.Router();
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

// router.post(
//   '/bulk-upload-validation',
//   multer(
//     FileInterceptor.multerOptions(
//       join(__dirname, '..', '..', '..', 'storage', 'v1', 'docs', 'products')
//     )
//   ).single('productsFile'),
//   ProductsBulkUploadService.productsBulkUploadValidation
// );

// router.post(
//   '/bulk-upload',
//   bulkUploadReq,
//   ProductsBulkUploadService.productsBulkUpload
// );
router.put('/update-position/:id', updateProductPosition);

module.exports = router;
