// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  attributeDropdown
} = require('../controllers/attribute');
const upload = require('../utils/upload');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const attributeSchema = Joi.object({
  name: Joi.string().required().min(3).max(100)
});

/**
 * @openapi
 * '/api/attribute':
 *  get:
 *     tags:
 *     - Attribute
 *     summary: Get all attributes
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Name of the page to filter attributes
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
 *       404:
 *         description: Not Found
 */
router.get('/', authorize('stock', 'view'), getAll);

/**
 * @openapi
 * '/api/attribute/dropdown':
 *  get:
 *     tags:
 *     - Attribute
 *     summary: Get attribute dropdown
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
router.get('/dropdown', authorize('stock', 'view'), attributeDropdown);

/**
 * @openapi
 * '/api/attribute/{id}':
 *  get:
 *     tags:
 *     - Attribute
 *     summary: Get attribute
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the attribute
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
 *       404:
 *         description: Not Found
 */
router.get('/:id', authorize('stock', 'view'), getOne);

/**
 * @openapi
 * '/api/attribute':
 *   post:
 *     tags:
 *       - Attribute
 *     summary: Create attribute
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ABCD"
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
 *                   example: "ABCD"
 *                 slug:
 *                   type: string
 *                   example: "abcd"
 *       404:
 *         description: Not Found
 */
router.post('/', authorize('stock', 'manage'), validateRequest(attributeSchema), create);
/**
 * @openapi
 * '/api/attribute/{id}':
 *   put:
 *     tags:
 *       - Attribute
 *     summary: update attribute
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the attribute
 *       schema:
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ABCD"
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
 *                   example: "ABCD"
 *                 slug:
 *                   type: string
 *                   example: "abcd"
 *       404:
 *         description: Not Found
 */
router.put('/:id', authorize("stock", "manage"), validateRequest(attributeSchema), updateOne);
/**
 * @openapi
 * '/api/attribute/{id}':
 *   delete:
 *     tags:
 *       - Attribute
 *     summary: Delete attribute
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the attribute
 *       schema:
 *         type: string
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
 *                   example: "ABCD"
 *                 slug:
 *                   type: string
 *                   example: "abcd"
 *       404:
 *         description: Not Found
 */
router.delete('/:id', authorize("stock", "delete"), deleteOne);



module.exports = router;