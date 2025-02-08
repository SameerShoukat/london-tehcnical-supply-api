// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  activateProduct,
  deActivateProduct,
  publishProduct,
  unPublishProduct
} = require('../controllers/product');
const upload = require('../utils/upload');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');


const publishProduct = Joi.object({
  catalogId: Joi.string().uuid().required().description('Catalog ID'),
  categoryId: Joi.string().uuid().required().description('Category ID'),
  subCategoryId: Joi.string().uuid().required().description('Subcategory ID'),
  websiteId: Joi.string().uuid().required().description('Website ID'),
  manufacturerName: Joi.string().optional().description('Manufacturer name'),
  manufacturerNumber: Joi.string().optional().description('Manufacturer part number'),
  manufacturerWarranty: Joi.string().optional().description('Warranty information'),
  brand: Joi.string().required().description('Product brand'),
  madeIn: Joi.string().optional().description('Country of origin'),
  totalStock: Joi.number().integer().min(0).required()
    .description('Total available stock'),
  inStock: Joi.number().integer().min(0).required()
    .description('Current stock available'),
  costPrice: Joi.number().precision(2).positive().required()
    .description('Cost price'),
  priceInUSD: Joi.number().precision(2).positive().required()
    .description('USD price'),
  priceInGBP: Joi.number().precision(2).positive().required()
    .description('GBP price'),
  priceInAED: Joi.number().precision(2).positive().required()
    .description('AED price'),
  name: Joi.string().required().min(3).max(255)
    .description('Product name')
});
const saveProduct = productCreateSchema.keys({
  catalogId: Joi.string().uuid().optional().description('Catalog ID'),
  categoryId: Joi.string().uuid().optional().description('Category ID'),
  subCategoryId: Joi.string().uuid().optional().description('Subcategory ID'),
  websiteId: Joi.string().uuid().optional().description('Website ID'),
  manufacturerName: Joi.string().optional().description('Manufacturer name'),
  manufacturerNumber: Joi.string().optional().description('Manufacturer part number'),
  manufacturerWarranty: Joi.string().optional().description('Warranty information'),
  brand: Joi.string().optional().description('Product brand'),
  madeIn: Joi.string().optional().description('Country of origin'),
  totalStock: Joi.number().integer().min(0).optional()
    .description('Total available stock'),
  inStock: Joi.number().integer().min(0).optional()
    .description('Current stock available'),
  costPrice: Joi.number().precision(2).positive().optional()
    .description('Cost price'),
  priceInUSD: Joi.number().precision(2).positive().optional()
    .description('USD price'),
  priceInGBP: Joi.number().precision(2).positive().optional()
    .description('GBP price'),
  priceInAED: Joi.number().precision(2).positive().optional()
    .description('AED price'),
  name: Joi.string().optional().min(3).max(255)
    .description('Product name')
}).min(1);



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
 *           type: integer
 *         description: Filter by catalog ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: subCategoryId
 *         schema:
 *           type: integer
 *         description: Filter by sub-category ID
 *       - in: query
 *         name: websiteId
 *         schema:
 *           type: integer
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
 *                 brand:
 *                   type: string
 *                   example: mercedes
 *                 totalStock:
 *                   type: number
 *                   example: 100
 *                 inStock:
 *                   type: number
 *                   example: 50
 *                 costPrice:
 *                   type: number
 *                   example: 85.5
 *                 priceInUSD:
 *                   type: number
 *                   example: 50
 *                 priceInGBP:
 *                   type: number
 *                   example: 85.5
 *                 priceInAED:
 *                   type: number
 *                   example: 85.5
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
 *                 brand:
 *                   type: string
 *                   example: mercedes
 *                 totalStock:
 *                   type: number
 *                   example: 100
 *                 inStock:
 *                   type: number
 *                   example: 50
 *                 costPrice:
 *                   type: number
 *                   example: 85.5
 *                 priceInUSD:
 *                   type: number
 *                   example: 50
 *                 priceInGBP:
 *                   type: number
 *                   example: 85.5
 *                 priceInAED:
 *                   type: number
 *                   example: 85.5
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
 *                 brand:
 *                   type: string
 *                   example: mercedes
 *                 totalStock:
 *                   type: number
 *                   example: 100
 *                 inStock:
 *                   type: number
 *                   example: 50
 *                 costPrice:
 *                   type: number
 *                   example: 85.5
 *                 priceInUSD:
 *                   type: number
 *                   example: 50
 *                 priceInGBP:
 *                   type: number
 *                   example: 85.5
 *                 priceInAED:
 *                   type: number
 *                   example: 85.5
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
 *                 brand:
 *                   type: string
 *                   example: mercedes
 *                 totalStock:
 *                   type: number
 *                   example: 100
 *                 inStock:
 *                   type: number
 *                   example: 50
 *                 costPrice:
 *                   type: number
 *                   example: 85.5
 *                 priceInUSD:
 *                   type: number
 *                   example: 50
 *                 priceInGBP:
 *                   type: number
 *                   example: 85.5
 *                 priceInAED:
 *                   type: number
 *                   example: 85.5
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
router.post('/publish', authorize('stock', 'manage'), upload.array('files', 5), validateRequest(publishProduct, true), create);

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
 *                 brand:
 *                   type: string
 *                   example: mercedes
 *                 totalStock:
 *                   type: number
 *                   example: 100
 *                 inStock:
 *                   type: number
 *                   example: 50
 *                 costPrice:
 *                   type: number
 *                   example: 85.5
 *                 priceInUSD:
 *                   type: number
 *                   example: 50
 *                 priceInGBP:
 *                   type: number
 *                   example: 85.5
 *                 priceInAED:
 *                   type: number
 *                   example: 85.5
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
 * '/api/product/active/{id}':
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
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */
router.patch('/active/:id', authorize('stock', 'manage'), activateProduct);

/**
 * @openapi
 * '/api/product/unActive/{id}':
 *   patch:
 *     tags:
 *       - Product
 *     summary: Set product to unActive
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
router.patch('/unActive/:id', authorize('stock', 'manage'), deActivateProduct);

/**
 * @openapi
 * '/api/product/publish/{id}':
 *   patch:
 *     tags:
 *       - Product
 *     summary: Set product to publish
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
router.patch('/publish/:id', authorize('stock', 'manage'), publishProduct);

/**
 * @openapi
 * '/api/product/unPublish/{id}':
 *   patch:
 *     tags:
 *       - Product
 *     summary: Set product to un publish
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
router.patch('/unPublish/:id', authorize('stock', 'manage'), unPublishProduct);



module.exports = router;