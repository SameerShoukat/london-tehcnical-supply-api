// routes/couponCodeRoutes.js
const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');
const { CURRENCY } = require('../constant/types');
const {
  create,
  getAll,
  getOne,
  updateOne,
  deleteOne,
  validateCode
} = require('../controllers/couponCodes');

// Validation schema
const couponSchema = Joi.object({
  type: Joi.string().valid('fixed', 'percentage').required(),
  code: Joi.string().valid(),
  currency: Joi.string().valid(...Object.values(CURRENCY)).required(),
  amount: Joi.number().min(0).required(),
  websiteId: Joi.string().guid({ version: 'uuidv4' }).required()
});
const validateSchemaForValidation = Joi.object({
  code: Joi.string().required(),
  currency: Joi.string().valid(...Object.values(CURRENCY)).required(),
  websiteId: Joi.string().guid({ version: 'uuidv4' }).required()
});

/**
 * @openapi
 * '/api/coupon-codes':
 *   get:
 *     tags:
 *       - CouponCode
 *     summary: Get all coupon codes
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: websiteId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by Website ID
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Pagination limit
 *     responses:
 *       200:
 *         description: List of coupon codes
 */
router.get('/', authorize('setting', 'view'), getAll);

/**
 * @openapi
 * '/api/coupon-codes/{id}':
 *   get:
 *     tags:
 *       - CouponCode
 *     summary: Get a coupon code by ID
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: CouponCode ID
 *     responses:
 *       200:
 *         description: Coupon code object
 *       404:
 *         description: Not found
 */
router.get('/:id', authorize('setting', 'view'), getOne);

/**
 * @openapi
 * '/api/coupon-codes':
 *   post:
 *     tags:
 *       - CouponCode
 *     summary: Create a coupon code
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponCode'
 *     responses:
 *       201:
 *         description: Created successfully
 *       409:
 *         description: Conflict
 */
router.post('/', authorize('setting', 'manage'), validateRequest(couponSchema), create);

/**
 * @openapi
 * '/api/coupon-codes/{id}':
 *   put:
 *     tags:
 *       - CouponCode
 *     summary: Update a coupon code
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: CouponCode ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponCode'
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Not found
 */
router.put('/:id', authorize('setting', 'manage'), validateRequest(couponSchema), updateOne);

/**
 * @openapi
 * '/api/coupon-codes/{id}':
 *   delete:
 *     tags:
 *       - CouponCode
 *     summary: Delete a coupon code
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: CouponCode ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
router.delete('/:id', authorize('setting', 'delete'), deleteOne);

/**
 * @openapi
 * '/api/coupon-codes/validate':
 *   post:
 *     tags:
 *       - CouponCode
 *     summary: Validate a coupon code
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               currency:
 *                 type: string
 *                 enum: [GBP, AED, USD]
 *               websiteId:
 *                 type: string
 *             required:
 *               - code
 *               - currency
 *               - websiteId
 *     responses:
 *       200:
 *         description: Coupon is valid
 *       404:
 *         description: Invalid coupon code
 */
router.post('/validate', authorize('setting', 'view'), validateRequest(validateSchemaForValidation), validateCode);

module.exports = router;
