const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  updateStatus,
  productDropdown
} = require('../controllers/product');
const upload = require('../utils/upload');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

const PRODUCT_STATUS = ['active','inactive','draft','discontinued', 'publish'];

const validationSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Name is required'
    }),
  sku: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Product Sku is required'
    }),
  inStock: Joi.number().integer().allow(null).optional(),
  catalogId: Joi.string().allow('', null).optional(),
  catId: Joi.string().allow('', null).optional(),
  websiteId: Joi.string().allow('', null).optional(),
  subCategoryId: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string()
    .valid(...PRODUCT_STATUS)
    .messages({
      'any.required': 'Please mark status'
    }),
  attributes: Joi.array().items(
    Joi.object({
      attributeId: Joi.string().allow('').optional(),
      value: Joi.string().allow('').optional()
    })
  ).optional(),
  pricing: Joi.array().items(Joi.object({
    currency: Joi.string().valid('USD', 'AED', 'GBP').allow('').optional(),
    discountType: Joi.string().valid('percentage', 'fixed').allow('').optional(),
    basePrice: Joi.number().optional(),
    discountValue: Joi.number().optional(),
    finalPrice: Joi.number().optional()
  })).optional()
});

/**
 * @openapi
 * '/api/product':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get all product
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: catalogId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by catalog ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: subCategoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by sub-category ID
 *       - in: query
 *         name: websiteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by website ID
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
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
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 catalogId:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 categoryId:
 *                   type: string
 *                   format: uuid
 *                   example: "987fcdeb-51a2-4321-9b42-789012345678"
 *                 subCategoryId:
 *                   type: string
 *                   format: uuid
 *                   example: "456e789a-b12c-3def-4567-890123456789"
 *                 websiteId:
 *                   type: string
 *                   format: uuid
 *                   example: "789abcde-f123-4567-89ab-cdef01234567"
 *                 name:
 *                   type: string
 *                   example: "Power Tool XL2000"
 *                 slug:
 *                   type: string
 *                   example: "power-tool-xl2000"
 *                 description:
 *                   type: string
 *                   example: "Professional grade power tool with advanced features"
 *                 inStock:
 *                   type: integer
 *                   example: 50
 *                 costPrice:
 *                   type: number
 *                   example: 85.5
 *                 costPriceCurrency:
 *                   type: string
 *                   example: "USD"
 *                 images:
 *                   type: array
 *                   example: ["https://example.com/image.jpg"]
 *                 attributes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attrId:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       value:
 *                         type: string
 *                         example: "Red"
 *                 pricing:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       currency:
 *                         type: string
 *                         example: "USD"
 *                       basePrice:
 *                         type: number
 *                         example: 99.99
 *                       discountType:
 *                         type: string
 *                         example: "percentage"
 *                       discountValue:
 *                         type: number
 *                         example: 10
 *                       finalPrice:
 *                         type: string
 *                         example: "89.99"
 *       404:
 *         description: Not Found
 */
router.get('/', authorize('stock', 'view'), getAll);

/**
 * @openapi
 * '/api/product/dropdown':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get product dropdown
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter product by search
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
router.get('/dropdown', authorize('stock', 'view'), productDropdown);

/**
 * @openapi
 * '/api/product/{id}':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get product
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product
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
 *                 catalog:
 *                   type: object
 *                   example: {name : volvo, id : "aajd99jjhfjh" }
 *                 category:
 *                   type: object
 *                   example: {name : volvo, id : "aajd99jjhfjh" }
 *                 subCategory:
 *                   type: object
 *                   example: {name : volvo, id : "aajd99jjhfjh" }
 *                 website:
 *                   type: object
 *                   example: {name : abcd.com, id : "aajd99jjhfjh" }
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *                 description:
 *                   type: number
 *                   example: klfjjklfjklfgklfdjkldfjklfjkld klfdkdfjkldfjkl
 *                 inStock:
 *                   type: number
 *                   example: 50
 *                 costPrice:
 *                   type: number
 *                   example: 85.5
 *                 costPriceCurrency:
 *                   type: number
 *                   example: 85.5
 *                 images:
 *                   type: array
 *                   example: ["https://example.com/image.jpg"]
 *                 attributes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attrId:
 *                         type: string
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       value:
 *                         type: string
 *                         example: "Red"
 *                 pricing:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       currency:
 *                         type: string
 *                         example: "USD"
 *                       basePrice:
 *                         type: number
 *                         example: 99.99
 *                       discountType:
 *                         type: string
 *                         example: "percentage"
 *                       discountValue:
 *                         type: number
 *                         example: 10
 *                       finalPrice:
 *                         type: string
 *                         example: "89.99"
 *       404:
 *         description: Not Found
 */
router.get('/:id', authorize('stock', 'view'), getOne);

/**
 * @openapi
 * '/api/product/save':
 *   post:
 *     tags:
 *       - Product
 *     summary: Create product
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
 *                 example: {
 *                   "name": "Power Drill X200",
 *                   "sku": "PDX200",
 *                   "inStock": 100,
 *                   "costPriceCurrency": "USD",
 *                   "costPrice": 299.99,
 *                   "catalogId": "550e8400-e29b-41d4-a716-446655440000",
 *                   "catId": "123e4567-e89b-12d3-a456-426614174000",
 *                   "websiteId": "987fcdeb-51a2-4321-9b42-789012345678",
 *                   "subCategoryId": "456e789a-b12c-3def-4567-890123456789",
 *                   "description": "Professional grade power drill with variable speed control",
 *                   "status": "active",
 *                   "attributes": [
 *                     {
 *                       "attributeId": "attr-123",
 *                       "value": "18V"
 *                     },
 *                     {
 *                       "attributeId": "attr-456", 
 *                       "value": "Cordless"
 *                     }
 *                   ]
 *                 }
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
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 sku:
 *                   type: string
 *                 inStock:
 *                   type: integer
 *                 costPriceCurrency:
 *                   type: string
 *                   enum: [USD, AED, GBP]
 *                 costPrice:
 *                   type: number
 *                 catalogId:
 *                   type: string
 *                   format: uuid
 *                 catId:
 *                   type: string
 *                   format: uuid
 *                 websiteId:
 *                   type: string
 *                   format: uuid
 *                 subCategoryId:
 *                   type: string
 *                   format: uuid
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [active, inactive, draft, discontinued, publish]
 *                 attributes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attributeId:
 *                         type: string
 *                       value:
 *                         type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Not Found
 */
router.post('/', authorize('stock', 'manage'), upload.array('files', 5), validateRequest(validationSchema, true), create);

/**
 * @openapi
 * '/api/product/{id}':
 *   put:
 *     tags:
 *       - Product
 *     summary: update product
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product
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
 *                 example: {
 *                   "name": "Power Drill X200",
 *                   "sku": "PDX200",
 *                   "inStock": 100,
 *                   "costPriceCurrency": "USD",
 *                   "costPrice": 299.99,
 *                   "catalogId": "550e8400-e29b-41d4-a716-446655440000",
 *                   "catId": "123e4567-e89b-12d3-a456-426614174000",
 *                   "websiteId": "987fcdeb-51a2-4321-9b42-789012345678",
 *                   "subCategoryId": "456e789a-b12c-3def-4567-890123456789",
 *                   "description": "Professional grade power drill with variable speed control",
 *                   "status": "active",
 *                   "attributes": [
 *                     {
 *                       "attributeId": "attr-123",
 *                       "value": "18V"
 *                     },
 *                     {
 *                       "attributeId": "attr-456", 
 *                       "value": "Cordless"
 *                     }
 *                   ]
 *                 }
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
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 sku:
 *                   type: string
 *                 inStock:
 *                   type: integer
 *                 costPriceCurrency:
 *                   type: string
 *                   enum: [USD, AED, GBP]
 *                 costPrice:
 *                   type: number
 *                 catalogId:
 *                   type: string
 *                   format: uuid
 *                 catId:
 *                   type: string
 *                   format: uuid
 *                 websiteId:
 *                   type: string
 *                   format: uuid
 *                 subCategoryId:
 *                   type: string
 *                   format: uuid
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [active, inactive, draft, discontinued, publish]
 *                 attributes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attributeId:
 *                         type: string
 *                       value:
 *                         type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Not Found
 */
router.put('/:id', authorize("stock", "manage"), upload.array('files', 5), validateRequest(validationSchema, true), updateOne);

/**
 * @openapi
 * '/api/product/{id}':
 *   delete:
 *     tags:
 *       - Product
 *     summary: Delete product
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */
router.delete('/:id', authorize("stock", "delete"), deleteOne);

/**
 * @openapi
 * '/api/product/update/{id}':
 *   patch:
 *     tags:
 *       - Product
 *     summary: Set product to active
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product
 *       schema:
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *                 description: Product active status
 *                 example: true
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */
router.patch('/active/:id', authorize('stock', 'manage'), updateStatus);





module.exports = router;