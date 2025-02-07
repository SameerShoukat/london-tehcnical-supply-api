// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  catalogDropdown
} = require('../controllers/catalog');
const upload = require('../utils/upload');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const catalogSchema = Joi.object({
  name: Joi.string().required().min(3).max(100)
});

/**
 * @openapi
 * '/api/catalog':
 *  get:
 *     tags:
 *     - Catalog
 *     summary: Get all catalogs
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Name of the page to filter catalogs
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
 * '/api/catalog/dropdown':
 *  get:
 *     tags:
 *     - Catalog
 *     summary: Get catalog dropdown
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
router.get('/dropdown', authorize('stock', 'view'), catalogDropdown);

/**
 * @openapi
 * '/api/catalog/{id}':
 *  get:
 *     tags:
 *     - Catalog
 *     summary: Get catalog
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the catalog
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
 * '/api/catalog':
 *   post:
 *     tags:
 *       - Catalog
 *     summary: Create catalog
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
 *                 example : {name: "ABCD"}
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
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *                 images:
 *                   type: string
 *                   example: ABCD
 *       404:
 *         description: Not Found
 */
router.post('/', authorize('stock', 'manage'), upload.array('files', 5), validateRequest(catalogSchema, true), create);
/**
 * @openapi
 * '/api/catalog/{id}':
 *   put:
 *     tags:
 *       - Catalog
 *     summary: update catalog
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the catalog
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
 *                 type: JSON
 *                 example : {name : ABCD}
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
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *                 images:
 *                   type: string
 *                   example: ABCD
 *       404:
 *         description: Not Found
 */
router.put('/:id', authorize("stock", "manage"), upload.array('files', 5),  validateRequest(catalogSchema, true), updateOne);
/**
 * @openapi
 * '/api/catalog/{id}':
 *   delete:
 *     tags:
 *       - Catalog
 *     summary: Delete catalog
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the catalog
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