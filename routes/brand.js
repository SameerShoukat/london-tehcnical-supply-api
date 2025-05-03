const express = require('express');
const router = express.Router();
const {
  create,
  getAll,
  getOne,
  updateOne,
  deleteOne,
  brandDropdown
} = require('../controllers/brands');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schema
const brandSchema = Joi.object({
  name: Joi.string().required().min(3).max(100)
});

/**
 * @openapi
 * '/api/brand':
 *   get:
 *     tags:
 *       - Brand
 *     summary: Get all brands
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         required: false
 *         description: Pagination offset
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of brands
 */
router.get('/', authorize('stock', 'view'), getAll);

/**
 * @openapi
 * '/api/brand/dropdown':
 *   get:
 *     tags:
 *       - Brand
 *     summary: Get brand dropdown
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Label/value list for dropdowns
 */
router.get('/dropdown', authorize('stock', 'view'), brandDropdown);

/**
 * @openapi
 * '/api/brand/{id}':
 *   get:
 *     tags:
 *       - Brand
 *     summary: Get a single brand
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand object
 *       404:
 *         description: Not found
 */
router.get('/:id', authorize('stock', 'view'), getOne);

/**
 * @openapi
 * '/api/brand':
 *   post:
 *     tags:
 *       - Brand
 *     summary: Create a new brand
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nike"
 *     responses:
 *       201:
 *         description: Brand created
 *       409:
 *         description: Conflict (already exists)
 */
router.post('/', authorize('stock', 'manage'), validateRequest(brandSchema), create);

/**
 * @openapi
 * '/api/brand/{id}':
 *   put:
 *     tags:
 *       - Brand
 *     summary: Update a brand
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Adidas"
 *     responses:
 *       200:
 *         description: Brand updated
 *       404:
 *         description: Not found
 */
router.put('/:id', authorize('stock', 'manage'), validateRequest(brandSchema), updateOne);

/**
 * @openapi
 * '/api/brand/{id}':
 *   delete:
 *     tags:
 *       - Brand
 *     summary: Soft-delete a brand
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', authorize('stock', 'delete'), deleteOne);

module.exports = router;
