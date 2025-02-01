// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createCatalog, 
  getCatalogs, 
  getLogById, 
  updateCatalog, 
  deleteCatalog 
} = require('../controllers/catalog');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const catalogSchema = Joi.object({
  name: Joi.string().required().min(3).max(100)
});

router.post('/', protect, validateRequest(catalogSchema), createCatalog);
router.get('/', getCatalogs);
router.get('/:id', getLogById);
router.put('/:id', protect, validateRequest(productSchema), updateCatalog);
router.delete('/:id', protect, deleteCatalog);

module.exports = router;