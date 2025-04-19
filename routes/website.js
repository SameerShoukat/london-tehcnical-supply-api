// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  websiteDropdown
} = require('../controllers/website');
const upload = require('../utils/upload');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const websiteSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  url: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
    .messages({
      'string.pattern.base': 'Invalid URL format. Example valid URLs: example-domain.com, my-site123.org'
    })
});

/**
 * @openapi
 * '/api/website':
 *  get:
 *     tags:
 *     - Website
 *     summary: Get all websites
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Name of the page to filter websites
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
 *                 url:
 *                   type: string
 *                   example: https://abcd.com
 *                 logo:
 *                   type: string
 *                   example: https://example.com/image.jpg
 *       404:
 *         description: Not Found
 */
router.get('/', authorize('setting', 'view'), getAll);


/**
 * @openapi
 * '/api/website/dropdown':
 *  get:
 *     tags:
 *     - Website
 *     summary: Get website dropdown
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
router.get('/dropdown', authorize('setting', 'view'), websiteDropdown);

/**
 * @openapi
 * '/api/website/{id}':
 *  get:
 *     tags:
 *     - Website
 *     summary: Get website
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the website
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
 *                 url:
 *                   type: string
 *                   example: https://abcd.com
 *                 logo:
 *                   type: string
 *                   example: https://example.com/image.jpg
 *       404:
 *         description: Not Found
 */
router.get('/:id', authorize('setting', 'view'), getOne);

/**
 * @openapi
 * '/api/website':
 *   post:
 *     tags:
 *       - Website
 *     summary: Create website
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
 *                 example : {name: "ABCD", url : "https://abcd.com"}
 *               file:
 *                 type: string
 *                 format: binary
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
 *                 url:
 *                   type: string
 *                   example: https://abcd.com
 *                 logo:
 *                   type: string
 *                   example: https://example.com/image.jpg
 *       404:
 *         description: Not Found
 */
router.post('/', authorize('setting', 'manage'), upload.single('file'), validateRequest(websiteSchema, true), create);

/**
 * @openapi
 * '/api/website/{id}':
 *   put:
 *     tags:
 *       - Website
 *     summary: update website
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the website
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
 *                 example : {name: "ABCD", url : "https://abcd.com"}
 *               file:
 *                 type: string
 *                 format: binary
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
 *                 url:
 *                   type: string
 *                   example: https://abcd.com
 *                 logo:
 *                   type: string
 *                   example: https://example.com/image.jpg
 *       404:
 *         description: Not Found
 */
router.put('/:id', authorize("setting", "manage"), upload.single('file'),  validateRequest(websiteSchema, true), updateOne);

/**
 * @openapi
 * '/api/website/{id}':
 *   delete:
 *     tags:
 *       - Website
 *     summary: Delete website
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the website
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */
router.delete('/:id', authorize("setting", "delete"), deleteOne);

module.exports = router;