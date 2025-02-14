const express =  require('express');
const router = express.Router();
const  isLoggedIn = require('../middlewares/isLoggedIn');
const {createProductValidation,editProductValidation,updateStatusProductValidation,updateRatingProductValidation,updateViewProductValidation,productFilterValidations} = require('../validations/productValidation');
const {createProduct , getAllProducts , getSellerProducts,getSellerOrders,updateStatusProductController,getProductDetails,updateProductViewAndRatingController,editProduct,getAllFilteredProducts} = require('../controllers/productControllers/productController');
const validate  =  require('../middlewares/validate');
const {upload,handleMulterErrors}  = require('../utils/multer');

router.post('/get_products',getAllProducts);

router.post('/get_filtered_products',validate(productFilterValidations),getAllFilteredProducts);

router.post('/get_product/:productId',getProductDetails);

router.post('/get_seller_products/:type',isLoggedIn,getSellerProducts);

router.post('/get_seller_orders',isLoggedIn,getSellerOrders);

router.post('/create-product',isLoggedIn,upload.array("files"),handleMulterErrors ,validate(createProductValidation),createProduct)

router.post('/edit_product/:productId',isLoggedIn,upload.array("files"),handleMulterErrors ,validate(editProductValidation),editProduct)

router.post("/change-status-product",isLoggedIn,validate(updateStatusProductValidation),updateStatusProductController);

router.post("/update-product-view",validate(updateViewProductValidation),updateProductViewAndRatingController);

router.post("update-product-rating",isLoggedIn,validate(updateRatingProductValidation),updateProductViewAndRatingController);

module.exports = router;