const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  updateStatus
} = require('../controllers/product');
const upload = require('../utils/upload');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');


const PRODUCT_STATUS = ['active','inactive','draft','discontinued', 'publish'];

const saveProduct = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().required(),
  description: Joi.string(),
  costPrice: Joi.number().positive(),
  costPriceCurrency: Joi.string().valid('USD', 'AED', 'GBP'),
  totalStock: Joi.number().integer().min(0),
  catalogId: Joi.string().uuid().description('Catalog ID'),
  catId: Joi.string().uuid().description('Category ID'), 
  subCategoryId: Joi.string().uuid().description('Subcategory ID'),
  websiteId: Joi.string().uuid().description('Website ID'),
  status: Joi.string().valid(...PRODUCT_STATUS).optional(),
  attributes: Joi.array().items(Joi.object({
    attrId: Joi.string().uuid(),
    value: Joi.string()
  })),
  pricing: Joi.array().items(Joi.object({
    currency: Joi.string().valid('USD', 'AED', 'GBP'),
    basePrice: Joi.number().positive(),
    discountType: Joi.string().valid('percentage', 'fixed'),
    discountValue: Joi.number().min(0).max(100).when('discountType', {
      is: 'percentage', 
      then: Joi.number().max(100)
    }),
    finalPrice: Joi.string().allow('')
  }))
});

const publishProductSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().required(),
  description: Joi.string(),
  costPrice: Joi.number().positive().required(),
  costPriceCurrency: Joi.string().valid('USD', 'AED', 'GBP').required(),
  totalStock: Joi.number().integer().min(0).required(),
  catalogId: Joi.string().uuid().required().description('Catalog ID'),
  catId: Joi.string().uuid().required().description('Category ID'),
  subCategoryId: Joi.string().uuid().required().description('Subcategory ID'),
  websiteId: Joi.string().uuid().required().description('Website ID'),
  status: Joi.string().valid(...PRODUCT_STATUS).required(),
  attributes: Joi.array().items(Joi.object({
    attrId: Joi.string().uuid().required(),
    value: Joi.string().required()
  })).required(),
  pricing: Joi.array().items(Joi.object({
    currency: Joi.string().valid('USD', 'AED', 'GBP').required(),
    basePrice: Joi.number().positive().required(),
    discountType: Joi.string().valid('percentage', 'fixed').required(),
    discountValue: Joi.number().min(0).max(100).when('discountType', {
      is: 'percentage',
      then: Joi.number().max(100)
    }).required(),
    finalPrice: Joi.string().allow('')
  })).min(1).required()
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
 *                 totalStock:
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
 *                 totalStock:
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
 *                 example : {"name":"test","description":"this is descrption","costPrice":500,"costPriceCurrency":"USD","catalogId":"","catId":"","subCategoryId":"0eb0be63-e5c8-4fa7-8707-6c10fff4cdb0","websiteId":"3b980e63-d9ea-4d0f-b953-84fb08ff0bf2","totalStock":6000,"attributes":[{"name":"898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd","value":"Mercedes"},{"name":"46800dc5-3c0c-4347-ab4d-aca7e5aa701e","value":"EFGH"},{"name":"664ba9fc-df2e-4fe1-a0cb-0da06e051906","value":"ABCD-82588"},{"name":"f349f76e-29eb-4776-9501-386de6efaa8d","value":"50"},{"name":"3e5e6507-599d-4819-83ae-00efc64f7ad3","value":"Germany"}],"pricing":[{"currency":"USD","basePrice":100,"discountType":"percentage","discountValue":5,"finalPrice":""},{"currency":"AED","basePrice":200,"discountType":"percentage","discountValue":10},{"currency":"GBP","basePrice":86,"discountType":"percentage","discountValue":3}]}
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
 *                 totalStock:
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
router.post('/save', authorize('stock', 'manage'), upload.array('files', 5), validateRequest(saveProduct, true), create);

/**
 * @openapi
 * '/api/product/publish':
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
 *                 example : {"name":"test","description":"this is descrption","costPrice":500,"costPriceCurrency":"USD","catalogId":"","catId":"","subCategoryId":"0eb0be63-e5c8-4fa7-8707-6c10fff4cdb0","websiteId":"3b980e63-d9ea-4d0f-b953-84fb08ff0bf2","totalStock":6000,"attributes":[{"name":"898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd","value":"Mercedes"},{"name":"46800dc5-3c0c-4347-ab4d-aca7e5aa701e","value":"EFGH"},{"name":"664ba9fc-df2e-4fe1-a0cb-0da06e051906","value":"ABCD-82588"},{"name":"f349f76e-29eb-4776-9501-386de6efaa8d","value":"50"},{"name":"3e5e6507-599d-4819-83ae-00efc64f7ad3","value":"Germany"}],"pricing":[{"currency":"USD","basePrice":100,"discountType":"percentage","discountValue":5,"finalPrice":""},{"currency":"AED","basePrice":200,"discountType":"percentage","discountValue":10},{"currency":"GBP","basePrice":86,"discountType":"percentage","discountValue":3}]}
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
 *                 totalStock:
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
router.post('/publish', authorize('stock', 'manage'), upload.array('files', 5), validateRequest(publishProductSchema, true), create);

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
 *                 example : {"catalogId":"d4e5f6a7-b8c9-4e0f-9012-3456789abcde","categoryId":"e5f6a7b8-c9d4-4e0f-9012-3456789abcdf","subCategoryId":"f6a7b8c9-d4e0-9012-3456-789abcde1234","websiteId":"a7b8c9d4-e0f9-0123-4567-89abcde12345","manufacturerName":"Acme Corporation","manufacturerNumber":"AC-1234","manufacturerWarranty":"2 years","brand":"Acme","madeIn":"USA","totalStock":100,"inStock":75,"costPrice":10.99,"priceInUSD":15.99,"priceInGBP":12.99,"priceInAED":58.99,"name":"Acme Super Widget"}
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
 *                 totalStock:
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
router.put('/:id', authorize("stock", "manage"), upload.array('files', 5), validateRequest(saveProduct, true),updateOne);

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