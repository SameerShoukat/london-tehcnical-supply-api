const express = require('express');
const router = express.Router();
const { 
    create,
    getOne,
    getAll,
    updateOne,
    deleteOne
} = require('../controllers/orders');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');
const {  CURRENCY } = require('../constant/types'); // Assuming shared schemas

const orderItemSchema = Joi.object({
  productId: Joi.string().uuid().required()
    .description('UUID of the product being ordered'),
  quantity: Joi.number().integer().min(1).max(1000).required()
    .description('Quantity of the product'),
  price: Joi.number().positive().precision(2).optional()
    .description('Price at time of order creation (snapshot)'),
  name: Joi.string().optional()
    .description('Product name (snapshot)'),
  sku: Joi.string().optional()
    .description('Product SKU (snapshot)')
}).oxor('price', 'productId')
  .with('price', ['name', 'sku']);

const addressValidationSchema = Joi.alternatives().try(
  Joi.object({
    addressId: Joi.string().uuid().required()
      .description('Existing address ID'),
  }),
  Joi.object({
    addressSnapshot: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().pattern(/^\d{5}(?:[-\s]\d{4})?$/).required(),
      country: Joi.string().length(2).uppercase().required(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
    }).required()
  })
).description('Either existing address ID or new address snapshot');

const validationSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required()
    .description('Array of order items'),
  paymentMethod: Joi.string().valid('cod', 'credit_card', 'paypal').default('cod')
    .description('Payment method type'),
  email: Joi.string().email().required()
    .description('Customer email address'),
  shippingAddress: addressValidationSchema.required()
    .description('Shipping address information'),
  billingAddress: addressValidationSchema.required()
    .description('Billing address information'),
  currency: Joi.allow(CURRENCY),
  customerNotes: Joi.string().max(500).optional()
    .description('Optional customer notes')
}).custom((value, helpers) => {
  // Custom validation for address types
  const shippingType = value.shippingAddress.addressSnapshot?.type;
  const billingType = value.billingAddress.addressSnapshot?.type;
  
  if (shippingType && shippingType !== 'shipping') {
    return helpers.error('any.invalid');
  }
  
  if (billingType && billingType !== 'billing') {
    return helpers.error('any.invalid');
  }
  
  return value;
}).messages({
  'any.invalid': 'Address snapshot type must match address type'
});




/**
 * @openapi
 * '/api/order':
 *  get:
 *     tags:
 *     - Order
 *     summary: Get all orders
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
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
 *                 orderNumber:
 *                   type: string
 *                 accountId:
 *                   type: string
 *                   format: uuid
 *                 website:
 *                   type: string
 *                 shippingAddressSnapshot:
 *                   type: object
 *                 billingAddressSnapshot:
 *                   type: object
 *                 currency:
 *                   type: string
 *                 subtotal:
 *                   type: number
 *                   format: decimal
 *                 shippingCost:
 *                   type: number
 *                   format: decimal
 *                 tax:
 *                   type: number
 *                   format: decimal
 *                 discount:
 *                   type: number
 *                   format: decimal
 *                 total:
 *                   type: number
 *                   format: decimal
 *                 status:
 *                   type: string
 *                 paymentStatus:
 *                   type: string
 *                 metadata:
 *                   type: object
 *                 notes:
 *                   type: string
 *       404:
 *         description: Not Found
 */

router.get('/', authorize('stock', 'view'), getAll);

/**
 * @openapi
 * '/api/order/{id}':
 *  get:
 *     tags:
 *     - Order
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
 *                   format: uuid
 *                 orderNumber:
 *                   type: string
 *                 accountId:
 *                   type: string
 *                   format: uuid
 *                 website:
 *                   type: string
 *                 shippingAddressSnapshot:
 *                   type: object
 *                 billingAddressSnapshot:
 *                   type: object
 *                 currency:
 *                   type: string
 *                 subtotal:
 *                   type: number
 *                   format: decimal
 *                 shippingCost:
 *                   type: number
 *                   format: decimal
 *                 tax:
 *                   type: number
 *                   format: decimal
 *                 discount:
 *                   type: number
 *                   format: decimal
 *                 total:
 *                   type: number
 *                   format: decimal
 *                 status:
 *                   type: string
 *                 paymentStatus:
 *                   type: string
 *                 metadata:
 *                   type: object
 *                 notes:
 *                   type: string
 *       404:
 *         description: Not Found
 */
router.get('/:id', authorize('stock', 'view'), getOne);

/**
 * @openapi
 * '/api/order':
 *  post:
 *     tags:
 *     - Order
 *     summary: Create a new order
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   addressSnapshot:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       type:
 *                         type: string
 *               billingAddress:
 *                 type: object
 *                 properties:
 *                   addressSnapshot:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                       type:
 *                         type: string
 *               currency:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               customerNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *       400:
 *         description: Bad request
 */
router.post('/', authorize('stock', 'manage'),  validateRequest(validationSchema), create);

/**
 * @openapi
 * '/api/order/{id}':
 *   put:
 *     tags:
 *       - Order
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   addressSnapshot:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       type:
 *                         type: string
 *               billingAddress:
 *                 type: object
 *                 properties:
 *                   addressSnapshot:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                       type:
 *                         type: string
 *               currency:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               customerNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *       400:
 *         description: Bad request
 */
router.put('/:id', authorize("stock", "manage"),  validateRequest(validationSchema), updateOne);

/**
 * @openapi
 * '/api/order/{id}':
 *   delete:
 *     tags:
 *       - Order
 *     summary: Delete order
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the order
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