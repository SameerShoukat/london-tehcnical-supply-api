// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/products');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().optional(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required()
});

router.post('/', protect, validateRequest(productSchema), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', protect, validateRequest(productSchema), updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;