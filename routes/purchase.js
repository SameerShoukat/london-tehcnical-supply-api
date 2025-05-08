const express = require("express");
const Joi = require("joi");
const router = express.Router();
const {
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
} = require("../controllers/purchase.js");
const { authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validation");
const { PURCHASE_STATUS } = require("../models/products/purchase");

// Validation schema
const SUPPORTED_CURRENCIES = ["USD", "AED", "GBP"];

const purchaseSchema = Joi.object({
  currency: Joi.string()
    .required()
    .valid(...SUPPORTED_CURRENCIES),
  status: Joi.string()
    .required()
    .valid(...Object.values(PURCHASE_STATUS)),
  vendorId: Joi.string().uuid().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
        costPrice: Joi.number().precision(2).min(0).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Purchase must have at least one item",
      "array.base": "Items must be an array",
    }),
  paymentType: Joi.string()
    .valid("cash", "card", "bank_transfer", "cheque")
    .optional(),
  paymentInformation: Joi.string().optional(),
  notes: Joi.string().optional(),
  paidAt: Joi.date().optional(),
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
 *                       items:
 *                         type: array
 *                         minItems: 1
 *                         items:
 *                           type: object
 *                           required:
 *                             - productId
 *                             - quantity
 *                             - costPrice
 *                           properties:
 *                             productId:
 *                               type: string
 *                               format: uuid
 *                               example: "123e4567-e89b-12d3-a456-426614174000"
 *                             quantity:
 *                               type: integer
 *                               minimum: 1
 *                               example: 100
 *                             costPrice:
 *                               type: number
 *                               format: float
 *                               minimum: 0
 *                               example: 10.99
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
router.get("/", authorize("purchase", "view"), getAll);

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
 *                       items:
 *                         type: array
 *                         minItems: 1
 *                         items:
 *                           type: object
 *                           required:
 *                             - productId
 *                             - quantity
 *                             - costPrice
 *                           properties:
 *                             productId:
 *                               type: string
 *                               format: uuid
 *                               example: "123e4567-e89b-12d3-a456-426614174000"
 *                             quantity:
 *                               type: integer
 *                               minimum: 1
 *                               example: 100
 *                             costPrice:
 *                               type: number
 *                               format: float
 *                               minimum: 0
 *                               example: 10.99
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
router.get("/:id", authorize("purchase", "view"), getOne);

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
 *               - status
 *               - vendorId
 *               - items
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [USD, AED, GBP]
 *                 description: Must be USD, AED, or GBP
 *                 example: "USD"
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, CANCELLED]
 *                 description: Purchase status
 *                 example: "PENDING"
 *               vendorId:
 *                 type: string
 *                 format: uuid
 *                 description: Valid UUID of existing vendor
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - costPrice
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 100
 *                     costPrice:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                       example: 10.99
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
 *                       items:
 *                         type: array
 *                         minItems: 1
 *                         items:
 *                           type: object
 *                           required:
 *                             - productId
 *                             - quantity
 *                             - costPrice
 *                           properties:
 *                             productId:
 *                               type: string
 *                               format: uuid
 *                               example: "123e4567-e89b-12d3-a456-426614174000"
 *                             quantity:
 *                               type: integer
 *                               minimum: 1
 *                               example: 100
 *                             costPrice:
 *                               type: number
 *                               format: float
 *                               minimum: 0
 *                               example: 10.99
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
router.post(
  "/",
  authorize("purchase", "manage"),
  validateRequest(purchaseSchema),
  create
);

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
 *               - status
 *               - vendorId
 *               - items
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [USD, AED, GBP]
 *                 description: Must be USD, AED, or GBP
 *                 example: "USD"
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, CANCELLED]
 *                 description: Purchase status
 *                 example: "PENDING"
 *               vendorId:
 *                 type: string
 *                 format: uuid
 *                 description: Valid UUID of existing vendor
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - costPrice
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 100
 *                     costPrice:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                       example: 10.99
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
 *                       items:
 *                         type: array
 *                         minItems: 1
 *                         items:
 *                           type: object
 *                           required:
 *                             - productId
 *                             - quantity
 *                             - costPrice
 *                           properties:
 *                             productId:
 *                               type: string
 *                               format: uuid
 *                               example: "123e4567-e89b-12d3-a456-426614174000"
 *                             quantity:
 *                               type: integer
 *                               minimum: 1
 *                               example: 100
 *                             costPrice:
 *                               type: number
 *                               format: float
 *                               minimum: 0
 *                               example: 10.99
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
router.put(
  "/:id",
  authorize("purchase", "manage"),
  validateRequest(purchaseSchema),
  updateOne
);

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
router.delete("/:id", authorize("purchase", "delete"), deleteOne);

module.exports = router;
