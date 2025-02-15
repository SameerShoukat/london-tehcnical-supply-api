const express = require('express');
const Joi = require("joi");
const router = express.Router();
const {create,
getAll,
updateOne,
getOne,
deleteOne
} = require('../controllers/purchase.js');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const {PURCHASE_STATUS} = require("../models/products/purchase")

// Validation schema
const SUPPORTED_CURRENCIES = ['USD', 'AED', 'GBP'];

const purchaseSchema = Joi.object({
    currency: Joi.string().required().valid(...SUPPORTED_CURRENCIES),
    status: Joi.string().required().valid(...Object.values(PURCHASE_STATUS)),
    quantity: Joi.number().integer().min(1).max(999999).required(),
    costPrice: Joi.number().precision(2).min(0).required(),
    vendorId: Joi.string().uuid().required(),
    productId: Joi.string().uuid().required(),
});


/**
 * @openapi
 * '/api/purchase':
 *  get:
 *     tags:
 *     - Purchase
 *     summary: Get all purchases
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         required: false
 *         description: Number of items per page
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
 *                   example: "Purchases retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       currency:
 *                         type: string
 *                         enum: [USD, AED, GBP]
 *                         description: Currency code
 *                         example: "USD"
 *                       quantity:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 999999
 *                         description: Purchase quantity
 *                         example: 100
 *                       costPrice:
 *                         type: number
 *                         format: float
 *                         minimum: 0
 *                         description: Cost price per unit
 *                         example: 10.99
 *                       totalAmount:
 *                         type: number
 *                         format: float
 *                         minimum: 0
 *                         description: Total purchase amount
 *                         example: 1099.00
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                         description: Product identifier
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         description: User identifier
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-14T12:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-14T12:00:00Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 100
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid pagination parameters"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', authorize('stock', 'view'), getAll);

/**
 * @openapi
 * '/api/purchase/{id}':
 *  get:
 *     tags:
 *     - Purchase
 *     summary: Get purchase
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the purchase
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
 *                   example: "Purchases retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       currency:
 *                         type: string
 *                         enum: [USD, AED, GBP]
 *                         description: Currency code
 *                         example: "USD"
 *                       quantity:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 999999
 *                         description: Purchase quantity
 *                         example: 100
 *                       costPrice:
 *                         type: number
 *                         format: float
 *                         minimum: 0
 *                         description: Cost price per unit
 *                         example: 10.99
 *                       totalAmount:
 *                         type: number
 *                         format: float
 *                         minimum: 0
 *                         description: Total purchase amount
 *                         example: 1099.00
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                         description: Product identifier
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         description: User identifier
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-14T12:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-14T12:00:00Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 100
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid pagination parameters"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', authorize('stock', 'view'), getOne);

/**
 * @openapi
 * /api/purchase:
 *   post:
 *     tags:
 *       - Purchase
 *     summary: Create purchase
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - quantity
 *               - costPrice
 *               - vendorId
 *               - productId
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [USD, AED, GBP]
 *                 description: Must be USD, AED, or GBP
 *                 example: "USD"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 999999
 *                 description: Integer between 1 and 999999
 *                 example: 100
 *               costPrice:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Decimal number greater than 0
 *                 example: 10.99
 *               vendorId:
 *                 type: string
 *                 format: uuid
 *                 description: Valid UUID of existing purchase
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: Valid UUID of existing product
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currency:
 *                   type: string
 *                   enum: [USD, AED, GBP]
 *                   description: Must be USD, AED, or GBP
 *                   example: "USD"
 *                 quantity:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 999999
 *                   description: Integer between 1 and 999999
 *                   example: 100
 *                 costPrice:
 *                   type: number
 *                   format: float
 *                   minimum: 0
 *                   description: Decimal number greater than 0
 *                   example: 10.99
 *                 totalAmount:
 *                   type: number
 *                   format: float
 *                   minimum: 0
 *                   description: Decimal number greater than 0
 *                   example: 1090
 *                 vendorId:
 *                   type: string
 *                   format: uuid
 *                   description: Valid UUID of existing purchase
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                   description: Valid UUID of existing product
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                   description: Valid UUID of existing user
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       404:
 *         description: Not Found
 */
router.post('/', authorize('stock', 'manage'),  validateRequest(purchaseSchema), create);

/**
 * @openapi
 * '/api/purchase/{id}':
 *   put:
 *     tags:
 *       - Purchase
 *     summary: update purchase
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the purchase
 *       schema:
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - quantity
 *               - costPrice
 *               - vendorId
 *               - productId
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [USD, AED, GBP]
 *                 description: Must be USD, AED, or GBP
 *                 example: "USD"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 999999
 *                 description: Integer between 1 and 999999
 *                 example: 100
 *               costPrice:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Decimal number greater than 0
 *                 example: 10.99
 *               vendorId:
 *                 type: string
 *                 format: uuid
 *                 description: Valid UUID of existing purchase
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: Valid UUID of existing product
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currency:
 *                   type: string
 *                   enum: [USD, AED, GBP]
 *                   description: Must be USD, AED, or GBP
 *                   example: "USD"
 *                 quantity:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 999999
 *                   description: Integer between 1 and 999999
 *                   example: 100
 *                 costPrice:
 *                   type: number
 *                   format: float
 *                   minimum: 0
 *                   description: Decimal number greater than 0
 *                   example: 10.99
 *                 totalAmount:
 *                   type: number
 *                   format: float
 *                   minimum: 0
 *                   description: Decimal number greater than 0
 *                   example: 1090
 *                 vendorId:
 *                   type: string
 *                   format: uuid
 *                   description: Valid UUID of existing purchase
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                   description: Valid UUID of existing product
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                   description: Valid UUID of existing user
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       404:
 *         description: Not Found
 */
router.put('/:id', authorize("stock", "manage"),   validateRequest(purchaseSchema), updateOne);

/**
 * @openapi
 * '/api/purchase/{id}':
 *   delete:
 *     tags:
 *       - Purchase
 *     summary: Delete purchase
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the purchase
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