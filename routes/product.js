const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  updateStatus,
  productDropdown,
  attributeList,
  productList,
  assignTag,
  removeTag,
  getProductDetail,
  searchProducts,
  restoreProducts,
  getSoftDeleted,
  copyProduct
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
  productCode : Joi.string().optional().allow('', null),
  inStock: Joi.number().integer().allow(null).optional(),
  catalogId: Joi.string().allow('', null).optional(),
  catId: Joi.string().allow('', null).optional(),
  subCategoryId: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string()
    .valid(...PRODUCT_STATUS)
    .required()
    .messages({
      'any.required': 'Please mark status'
    }),
  attributes: Joi.array().items(
    Joi.object({
      attributeId: Joi.string().allow('').optional(),
      value: Joi.string().allow('').optional()
    })
  ).optional(),
  websiteId: Joi.array()
  .items(Joi.string())  // Define array items as UUIDs
  .allow(null)                 // Allow null value
  .default([])                 // Set default as empty array
  .when('status', {
    is: 'publish',
    then: Joi.array().min(1).messages({
      'array.min': 'At least one Website ID is required for publish status'
    }),
    otherwise: Joi.array().optional()
  }),
  pricing: Joi.array().items(Joi.object({
    currency: Joi.string().valid('USD', 'AED', 'GBP').allow('').optional(),
    basePrice: Joi.number().optional(),
    discountType: Joi.string().valid('percentage', 'fixed').allow('').optional(),
    discountValue: Joi.number().allow('').optional(),
    finalPrice: Joi.number().optional()
  })).optional()
});


const { 
  createCode,
  getAllCodes,
  updateOneCode,
  getOneCode,
  deleteOneCode,
  codesDropdown
} = require('../controllers/productCode');

// Validation schemas
const productCodeValidationSchema = Joi.object({
  code: Joi.string().required().min(3).max(100)
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
 * '/api/product/deleted':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get all deleted products
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
router.get('/deleted', authorize('stock', 'manage'), getSoftDeleted);

/**
 * @openapi
 * '/api/product/attributes':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get all product
 *     parameters:
 *       - in: query
 *         name: attributeName
 *         schema:
 *           type: string
 *         description: Filter by attribute
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
 *                 productCount:
 *                   type: string
 *                   format: uuid
 *                   example: 950
 *                 value:
 *                   type: string
 *                   format: uuid
 *                   example: Audi
 *       404:
 *         description: Not Found
 */
router.get('/attributes', attributeList);

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
 * '/api/product/codes':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get all product codes
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Name of the page to filter product codes
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
 *                 code:
 *                   type: string
 *                   example: ABCD
 *       404:
 *         description: Not Found
 */
router.get('/codes', authorize('stock', 'view'), getAllCodes);

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
 * '/api/product/list':
 *   post:
 *     tags:
 *       - Product
 *     summary: Get product by filter
 *     parameters:
 *       - in: query
 *         name: websiteId
 *         schema:
 *           type: string
 *         description: Filter by websiteId
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tires__wheels"]
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["all-season_tires"]
 *               brands:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Ford Performance", "Enkei"]
 *               vehicle_type:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Electric", "suv"]
 *               tag:
 *                 type: string
 *                 items:
 *                   type: string
 *                 example: "best_selling"
 *                   
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
router.post('/list', productList);

/**
 * @openapi
 * '/api/product/details/{slug}':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get product details by slug
 *     parameters:
 *     - name: slug
 *       in: path
 *       required: true
 *       description: Slug of the product
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "gdgdgdgdcbcbcb"
 *                     sku:
 *                       type: string
 *                       example: "PDX200"
 *                     name:
 *                       type: string
 *                       example: "Power Drill X200"
 *                     slug:
 *                       type: string
 *                       example: "power-drill-x200"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "on_sale"
 *                     inStock:
 *                       type: integer
 *                       example: 100
 *                     description:
 *                       type: string
 *                       example: "Professional grade power drill with variable speed control"
 *                     productPricing:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           currency:
 *                             type: string
 *                             example: "GBP"
 *                           discountType:
 *                             type: string
 *                             example: "percentage"
 *                           discountValue:
 *                             type: number
 *                             example: 10
 *                           basePrice:
 *                             type: number
 *                             example: 299.99
 *                           finalPrice:
 *                             type: number
 *                             example: 269.99
 *                     productAttributes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "18V"
 *                           attribute:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Battery Voltage"
 *                     category:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Tools"
 *                         slug:
 *                           type: string
 *                           example: "tools"
 *                     subcategory:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Power Tools"
 *                         slug:
 *                           type: string
 *                           example: "power-tools"
 *       404:
 *         description: Product not found
 */
router.get('/details/:slug', getProductDetail);

/**
 * @openapi
 * '/api/product/search/{name}':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get product search by name
 *     parameters:
 *     - name: name
 *       in: path
 *       required: true
 *       description: name of the product
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "gdgdgdgdcbcbcb"
 *                     sku:
 *                       type: string
 *                       example: "PDX200"
 *                     name:
 *                       type: string
 *                       example: "Power Drill X200"
 *                     slug:
 *                       type: string
 *                       example: "power-drill-x200"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "on_sale"
 *                     inStock:
 *                       type: integer
 *                       example: 100
 *                     description:
 *                       type: string
 *                       example: "Professional grade power drill with variable speed control"
 *                     productPricing:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           currency:
 *                             type: string
 *                             example: "GBP"
 *                           discountType:
 *                             type: string
 *                             example: "percentage"
 *                           discountValue:
 *                             type: number
 *                             example: 10
 *                           basePrice:
 *                             type: number
 *                             example: 299.99
 *                           finalPrice:
 *                             type: number
 *                             example: 269.99
 *                     productAttributes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "18V"
 *                           attribute:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Battery Voltage"
 *                     category:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Tools"
 *                         slug:
 *                           type: string
 *                           example: "tools"
 *                     subcategory:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Power Tools"
 *                         slug:
 *                           type: string
 *                           example: "power-tools"
 *       404:
 *         description: Product not found
 */
router.get('/search/:name', searchProducts);

/**
 * @openapi
 * '/api/product/assignTag':
 *   post:
 *     tags:
 *       - Product
 *     summary: Assign tag to product
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag:
 *                 type: string
 *                 example: on_sale
 *               productId:
 *                 type: string
 *                 example: 123456-cac6-417a-a68f-c47884e5a520
 *     responses:
 *       200:
 *         description: Tag has been assigned to product
 *       404:
 *         description: Not Found
 */
router.post('/assignTag', authorize('stock', 'manage'),  assignTag);

/**
 * @openapi
 * '/api/product/removeTag':
 *   post:
 *     tags:
 *       - Product
 *     summary: Remove tag from product
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag:
 *                 type: string
 *                 example: on_sale
 *               productId:
 *                 type: string
 *                 example: 123456-cac6-417a-a68f-c47884e5a520
 *     responses:
 *       200:
 *         description: Tag has been assigned to product
 *       404:
 *         description: Not Found
 */
router.post('/removeTag', authorize('stock', 'manage'), removeTag);

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
 *                   "productCode": "ATS8200",
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
 *                   "productCode": "ATS8200",
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

/**
 * @openapi
 * '/api/product/restore/{id}':
 *   patch:
 *     tags:
 *       - Product
 *     summary: restore product
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
router.patch('/restore/:id', authorize('stock', 'manage'), restoreProducts);


/**
 * @openapi
 * '/api/product/copy/{id}':
 *   patch:
 *     tags:
 *       - Product
 *     summary: copy product
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
router.patch('/copy/:id', authorize('stock', 'manage'), copyProduct);

// product codes

/**
 * @openapi
 * '/api/product/codes/dropdown':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get product codes dropdown
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
router.get('/codes/dropdown', authorize('stock', 'view'), codesDropdown);

/**
 * @openapi
 * '/api/product/codes/{id}':
 *  get:
 *     tags:
 *     - Product
 *     summary: Get product code
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product code
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
 *                 code:
 *                   type: string
 *                   example: ABCD
 *       404:
 *         description: Not Found
 */
router.get('/codes/:id', authorize('stock', 'view'), getOneCode);

/**
 * @openapi
 * '/api/product/codes':
 *   post:
 *     tags:
 *       - Product
 *     summary: Create product codes
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
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
 *                 code:
 *                   type: string
 *                   example: "ABCD"
 *       404:
 *         description: Not Found
 */
router.post('/codes', authorize('stock', 'manage'), validateRequest(productCodeValidationSchema), createCode);

/**
 * @openapi
 * '/api/product/codes/{id}':
 *   put:
 *     tags:
 *       - Product
 *     summary: update product codes
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product codes
 *       schema:
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
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
 *                 code:
 *                   type: string
 *                   example: "ABCD"
 *       404:
 *         description: Not Found
 */
router.put('/codes/:id', authorize("stock", "manage"), validateRequest(productCodeValidationSchema), updateOneCode);

/**
 * @openapi
 * '/api/product/codes/{id}':
 *   delete:
 *     tags:
 *       - Product
 *     summary: Delete product code
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product code
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
 *                 code:
 *                   type: string
 *                   example: "ABCD"
 *                 slug:
 *                   type: string
 *                   example: "abcd"
 *       404:
 *         description: Not Found
 */
router.delete('/codes/:id', authorize("stock", "delete"), deleteOneCode);

module.exports = router;