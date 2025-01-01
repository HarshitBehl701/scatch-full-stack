const express =  require('express');
const router = express.Router();
const  isLoggedIn = require('../middlewares/isLoggedIn');
const {createProductValidation} = require('../validations/productValidation');
const {createProduct , getAllProducts , getProduct} = require('../controllers/productControllers/productController');
const validate  =  require('../middlewares/validate');
const {upload,handleMulterErrors}  = require('../utils/multer');

router.post('/get_products',getAllProducts);

router.post('/get_product',getProduct);

router.post('/create-product',isLoggedIn,upload.array("files"),handleMulterErrors ,validate(createProductValidation),createProduct)

module.exports = router;