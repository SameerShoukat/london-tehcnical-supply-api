// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  categoryDropdown
} = require('../controllers/category');
const upload = require('../utils/upload');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const categorySchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  catalogId : Joi.string().required()
});

/**
 * @openapi
 * '/api/category':
 *  get:
 *     tags:
 *     - Category
 *     summary: Get all category
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Name of the page to filter category
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 catalogId:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *                 images:
 *                   type: array
 *                   example: ["https://example.com/image.jpg"]
 *       404:
 *         description: Not Found
 */
router.get('/', authorize('stock', 'view'), getAll);

/**
 * @openapi
 * '/api/category/dropdown':
 *  get:
 *     tags:
 *     - Catalog
 *     summary: Get category dropdown
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: ABCD
 *                   value:
 *                     type: string
 *                     example: "gdgdgdgdcbcbcb"
 *       404:
 *         description: Not Found
 */
router.get('/dropdown', authorize('stock', 'view'), categoryDropdown);

/**
 * @openapi
 * '/api/category/{id}':
 *  get:
 *     tags:
 *     - Category
 *     summary: Get category
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the category
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 category:
 *                   type: object
 *                   example: {name: "ABCD"}
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *                 images:
 *                   type: array
 *                   example: ["https://example.com/image.jpg"]
 *       404:
 *         description: Not Found
 */
router.get('/:id', authorize('stock', 'view'), getOne);

/**
 * @openapi
 * '/api/category':
 *   post:
 *     tags:
 *       - Category
 *     summary: Create category
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 example : {name: "ABCD", catalogId: "gdgdgdgdcbcbcb"}
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             minItems: 1  # Specify the minimum number of items (files) required
 *             maxItems: 5  # Specify the maximum number of items (files) allowed
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 catalogId:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *                 images:
 *                   type: array
 *                   example: ["https://example.com/image.jpg"]
 *       404:
 *         description: Not Found
 */
router.post('/', authorize('stock', 'manage'), upload.array('files', 5), validateRequest(categorySchema, true), create);
/**
 * @openapi
 * '/api/category/{id}':
 *   put:
 *     tags:
 *       - Category
 *     summary: update category
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the category
 *       schema:
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 example : {name: "ABCD", catalogId: "gdgdgdgdcbcbcb"}
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             minItems: 1  # Specify the minimum number of items (files) required
 *             maxItems: 5  # Specify the maximum number of items (files) allowed
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 catalogId:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *                 images:
 *                   type: array
 *                   example: ["https://example.com/image.jpg"]
 *       404:
 *         description: Not Found
 */
router.put('/:id', authorize("stock", "manage"), upload.array('files', 5), updateOne);
/**
 * @openapi
 * '/api/category/{id}':
 *   delete:
 *     tags:
 *       - Category
 *     summary: Delete category
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the category
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */
router.delete('/:id', authorize("stock", "delete"), deleteOne);



module.exports = router;