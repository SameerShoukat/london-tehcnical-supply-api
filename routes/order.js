const express = require('express');
const router = express.Router();
const { 
    create,
    getOne,
    getAll,
    updateOne,
    deleteOne,
    getOneByOrderNumber,
    updateStatus,
    updatePaymentStatus,
    reviewOrder,
    createManualOrder,
    orderAnalytics
} = require('../controllers/orders');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');
const { ORDER_STATUS, ORDER_PAYMENT_STATUS } = require('../constant/types')

const updateStatusSchema = Joi.object({
  orderId: Joi.string().uuid().required()
    .description('UUID of the order to update'),
  type: Joi.string().valid('order', 'payment').required()
    .description('Type of status update'),
  status: Joi.string().required()
    .custom((value, helpers) => {
      const type = helpers.state.ancestors[0].type;
      if (type === 'order' && !Object.values(ORDER_STATUS).includes(value)) {
        return helpers.error('any.invalid');
      }
      if (type === 'payment' && !Object.values(ORDER_PAYMENT_STATUS).includes(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .description('New status for the order'),
  reason: Joi.string().max(500).optional().allow('')
}).messages({
  'any.invalid': 'Invalid status for the specified type'
});

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
  
const addressSnapshotSchema = Joi.object({
    firstName: Joi.string().required().description('First name'),
    lastName: Joi.string().required().description('Last name'),
    addressLine1: Joi.string().required().description('Primary address line'),
    addressLine2: Joi.string().optional().allow('').description('Secondary address line'),
    country: Joi.string().required().description('Country'),
    city: Joi.string().required().description('City'),
    state: Joi.string().required().description('State'),
    postalCode: Joi.string().pattern(/^\d{5}(?:[-\s]\d{4})?$/).required()
      .description('Postal code'),
    phone: Joi.string().pattern(/^(?:\+?[1-9]|0)\d{1,14}$/).optional()
      .description('Phone number')
});
  
  const addressValidationSchema = Joi.object({
    addressId: Joi.string().uuid()
      .description('Existing address ID'),
    addressSnapshot: addressSnapshotSchema
      .description('New address snapshot')
  }).oxor('addressId', 'addressSnapshot')
    .description('Either existing address ID or new address snapshot');
  
  const validationSchema = Joi.object({
    couponCode: Joi.string().optional().allow('', null),
    website: Joi.string().required()
      .description('Website of the order'),
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
    subtotal: Joi.number().precision(2).required()
      .description('Order subtotal'),
    shippingCost: Joi.number().precision(2).required()
      .description('Shipping cost'),
    tax: Joi.number().precision(2).required()
      .description('Tax amount'),
    discount: Joi.number().precision(2).required()
      .description('Discount applied'),
    total: Joi.number().precision(2).required()
      .description('Total order amount'),
    customerNotes: Joi.string().max(500).allow(null).optional()
      .description('Optional customer notes')
  }).custom((value, helpers) => {
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
  
  const reviewValidationSchema = Joi.object({
    items: Joi.array().items(Joi.object({
      productId: Joi.string().uuid().required()
        .description('UUID of the product'),
      quantity: Joi.number().positive().required()
        .description('Quantity of items')
    })).min(1).required(),
    paymentMethod: Joi.string().valid('cod', 'credit_card', 'paypal').default('cod')
      .description('Payment method'),
    email: Joi.string().email().required()
      .description('Customer email'),
    shippingAddress: addressSnapshotSchema.required(),
    billingAddress: addressSnapshotSchema.optional(),
    shippingCost: Joi.number().optional().allow('', null, 0),
    tax: Joi.number().optional().allow('', null, 0),
    discount: Joi.number().optional().allow('', null, 0),
    customerNotes: Joi.string().max(500).allow('', null),
    currency: Joi.string().optional(),
    paymentStatus: Joi.string().valid('paid', 'unpaid'),
    sameAsShipping: Joi.boolean().optional()
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
router.get('/', authorize('orders', 'view'), getAll);

/**
 * @openapi
 * '/api/order/analytics':
 *  get:
 *     tags:
 *     - Order
 *     summary: Get analytics of the order
 *     security:
 *     - Bearer: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           default: '2025-04-01'
 *         description: Start date of the analytics period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           default: '2025-04-30'
 *         description: End date of the analytics period
 *       - in: query
 *         name: website
 *         schema:
 *           type: string
 *           default: ''
 *         description: Filter analytics by website
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               period: "Tue Apr 01 2025 00:00:00 GMT+0500 (Pakistan Standard Time) to Wed Apr 30 2025 00:00:00 GMT+0500 (Pakistan Standard Time)"
 *               total_orders: 8
 *               total_sales: 1421.42
 *               average_order_value: 177.6775
 *               total_subtotal: 1020
 *               total_discount: 103.5
 *               total_tax: 417
 *               total_shipping: 65.94
 *               status_distribution:
 *                 delivered: { count: 1, total: 118.74 }
 *                 on_hold: { count: 1, total: 210.99 }
 *                 pending: { count: 5, total: 972.95 }
 *                 processing: { count: 1, total: 118.74 }
 *               payment_status_distribution:
 *                 paid: { count: 3, total: 448.47 }
 *                 unpaid: { count: 5, total: 972.95 }
 *               order_type_distribution:
 *                 manual: { count: 8, total: 1421.42 }
 *               currency_distribution:
 *                 GBP: { count: 8, total: 1421.42 }
 *               order_status_summary:
 *                 pending: 5
 *                 confirmed: 0
 *                 processing: 1
 *                 on_hold: 1
 *                 shipped: 0
 *                 delivered: 1
 *                 cancelled: 0
 *                 returned: 0
 *               coupon_usage:
 *                 orders_with_coupons: 0
 *                 coupon_usage_rate: 0
 *                 total_discount: 0
 *                 average_discount: 0
 *                 popular_coupons: []
 *               customer_analysis:
 *                 - accountId: "28fd8239-16a0-4d9a-b9b7-f6a04cea8da1"
 *                   order_count: "8"
 *                   total_spent: "1421.42"
 *       404:
 *         description: Not Found
 */

router.get('/analytics', authorize('orders', 'view'), orderAnalytics);

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
router.get('/:id', authorize('orders', 'view'), getOne);

/**
 * @openapi
 * '/api/order/one/{orderId}':
 *  get:
 *     tags:
 *     - Order
 *     summary: Get product
 *     parameters:
 *     - name: orderId
 *       in: path
 *       required: true
 *       description: orderId of the product
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
router.get('/one/:orderId', getOneByOrderNumber);

/**
 * @openapi
 * '/api/order':
 *  post:
 *     tags:
 *     - Order
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               website:
 *                 type: string
 *                 example: "localhost"
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
 *                     name:
 *                       type: string
 *                     sku:
 *                       type: string
 *               shippingAddress:
 *                 type: object
 *                 description: Shipping address information
 *                 properties:
 *                   addressSnapshot:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       addressLine1:
 *                         type: string
 *                       addressLine2:
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
 *                 description: Billing address information
 *                 properties:
 *                   addressSnapshot:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       addressLine1:
 *                         type: string
 *                       addressLine2:
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
 *               subtotal:
 *                 type: number
 *                 example: 80
 *               shippingCost:
 *                 type: number
 *                 example: 5.99
 *               tax:
 *                 type: number
 *                 example: 8
 *               discount:
 *                 type: number
 *                 example: 0
 *               total:
 *                 type: number
 *                 example: 93.99
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, credit_card, paypal]
 *                 default: cod
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
router.post('/', validateRequest(validationSchema), create);

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
router.put('/:id', authorize("orders", "manage"),  validateRequest(validationSchema), updateOne);

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
router.delete('/:id', authorize("orders", "delete"), deleteOne);

/**
 * @openapi
 * '/api/order/status':
 *   patch:
 *     tags:
 *       - Order
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - status
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the order to update
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *                 description: New status for the order
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional reason for status change
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid request or status change not allowed
 *       404:
 *         description: Order not found
 */
router.patch('/status', authorize('orders', 'manage'), validateRequest(updateStatusSchema), updateStatus);

/**
 * @openapi
 * '/api/order/paymentStatus':
 *   patch:
 *     tags:
 *       - Order
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - status
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the order to update
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *                 description: New status for the order
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional reason for status change
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid request or status change not allowed
 *       404:
 *         description: Order not found
 */
router.patch('/paymentStatus', authorize('orders', 'manage'), validateRequest(updateStatusSchema), updatePaymentStatus);


/**
 * @openapi
 * '/api/order/review':
 *  post:
 *     tags:
 *     - Order
 *     summary: Review order details before creation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - email
 *               - shippingAddress
 *               - billingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, credit_card, paypal]
 *               email:
 *                 type: string
 *                 format: email
 *               shippingAddress:
 *                 $ref: '#/components/schemas/AddressSnapshot'
 *               billingAddress:
 *                 $ref: '#/components/schemas/AddressSnapshot'
 *               shippingCost:
 *                 type: number
 *               tax:
 *                 type: number
 *               discount:
 *                 type: number
 *               customerNotes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Order review successful
 *       400:
 *         description: Validation error
 */
router.post('/review', authorize('orders', 'manage'), validateRequest(reviewValidationSchema), reviewOrder);


/**
 * @openapi
 * '/api/order/manual':
 *  post:
 *     tags:
 *     - Order
 *     summary: Create a manual order
 *     security:
 *     - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - email
 *               - shippingAddress
 *               - currency
 *             properties:
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
 *               email:
 *                 type: string
 *                 format: email
 *               currency:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, credit_card, paypal]
 *               shippingCost:
 *                 type: number
 *               tax:
 *                 type: number
 *               discount:
 *                 type: number
 *               customerNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manual order created successfully
 *       400:
 *         description: Bad request
 */

router.post('/manual', authorize('orders', 'manage'), validateRequest(reviewValidationSchema), createManualOrder);



module.exports = router;