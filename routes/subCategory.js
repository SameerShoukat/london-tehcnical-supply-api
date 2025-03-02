// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  subCategoryDropdown
} = require('../controllers/subCategory');
const upload = require('../utils/upload');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const subCategorySchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
   description : Joi.string().allow(''),
  catId : Joi.string().required()
});

/**
 * @openapi
 * '/api/subCategory':
 *  get:
 *     tags:
 *     - SubCategory
 *     summary: Get all sub category
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Name of the page to filter subCategory
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
 *                 catId:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 description:
 *                   type: string
 *                   example: This is description
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
 * '/api/subCategory/dropdown':
 *  get:
 *     tags:
 *     - SubCategory
 *     summary: Get sub category dropdown
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: catId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the category to filter subCategory
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
router.get('/dropdown', authorize('stock', 'view'), subCategoryDropdown);


/**
 * @openapi
 * '/api/subCategory/{id}':
 *  get:
 *     tags:
 *     - SubCategory
 *     summary: Get sub category
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the sub category
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
 *                 catId:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 description:
 *                   type: string
 *                   example: This is description
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
 * '/api/subCategory':
 *   post:
 *     tags:
 *       - SubCategory
 *     summary: Create sub category
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
 *                 example : {name: "ABCD", catId: "gdgdgdgdcbcbcb"}
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
 *                 catId:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 description:
 *                   type: string
 *                   example: This is description
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *                 images:
 *                   type: array
 *                   example: ["https://example.com/image.jpg"]
 *       404:
 *         description: Not Found
 */
router.post('/', authorize('stock', 'manage'), upload.array('files', 5), validateRequest(subCategorySchema, true), create);
/**
 * @openapi
 * '/api/subCategory/{id}':
 *   put:
 *     tags:
 *       - SubCategory
 *     summary: update sub category
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the sub category
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
 *                 example : {name: "ABCD", catId: "gdgdgdgdcbcbcb"}
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
 *                 catId:
 *                   type: string
 *                   example: "gdgdgdgdcbcbcb"
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 description:
 *                   type: string
 *                   example: This is description
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
 * '/api/subCategory/{id}':
 *   delete:
 *     tags:
 *       - SubCategory
 *     summary: Delete sub category
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the sub category
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