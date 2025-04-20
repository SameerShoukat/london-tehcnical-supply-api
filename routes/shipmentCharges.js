// routes/shipmentChargeRoutes.js
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
  calculateShipmentCharge
} = require('../controllers/shipmentCharges');

// Validation schema
const shipmentChargeSchema = Joi.object({
  type: Joi.string().valid('fixed', 'percentage').required(),
  currency: Joi.string().valid(...Object.values(CURRENCY)).required(),
  amount: Joi.number().min(0).required(),
  websiteId: Joi.string().guid({ version: 'uuidv4' }).required()
});

const calculateShipmentChargeSchema = Joi.object({
  country: Joi.string().required(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  totalAmount: Joi.number().positive().required()
})

/**
 * @openapi
 * '/api/shipment-charges':
 *   get:
 *     tags:
 *       - ShipmentCharge
 *     summary: Get all shipment charges
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
 *         description: List of shipment charges
 */
router.get('/', authorize('setting', 'view'), getAll);

/**
 * @openapi
 * '/api/shipment-charges/{id}':
 *   get:
 *     tags:
 *       - ShipmentCharge
 *     summary: Get a shipment charge by ID
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ShipmentCharge ID
 *     responses:
 *       200:
 *         description: Shipment charge object
 *       404:
 *         description: Not found
 */
router.get('/:id', authorize('setting', 'view'), getOne);

/**
 * @openapi
 * '/api/shipment-charges':
 *   post:
 *     tags:
 *       - ShipmentCharge
 *     summary: Create a shipment charge
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [GBP, AED, USD]
 *               amount:
 *                 type: number
 *               url:
 *                 type: string
 *               websiteId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created successfully
 *       409:
 *         description: Conflict
 */
router.post('/', authorize('setting', 'manage'), validateRequest(shipmentChargeSchema), create);

/**
 * @openapi
 * '/api/shipment-charges/{id}':
 *   put:
 *     tags:
 *       - ShipmentCharge
 *     summary: Update a shipment charge
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ShipmentCharge ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [GBP, AED, USD]
 *               amount:
 *                 type: number
 *               url:
 *                 type: string
 *               websiteId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Not found
 */
router.put('/:id', authorize('setting', 'manage'), validateRequest(shipmentChargeSchema), updateOne);

/**
 * @openapi
 * '/api/shipment-charges/{id}':
 *   delete:
 *     tags:
 *       - ShipmentCharge
 *     summary: Delete a shipment charge
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ShipmentCharge ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
router.delete('/:id', authorize('setting', 'delete'), deleteOne);


/**
 * @openapi
 * '/api/shipment-charges/calculate':
 *   post:
 *     tags:
 *       - ShipmentCharge
 *     summary: Calculate shipment charge based on country and amount
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 description: Country code
 *               zipCode:
 *                 type: string
 *                 description: zip code
 *               state:
 *                 type: string
 *                 description: state
 *               totalAmount:
 *                 type: number
 *                 description: Total order amount
 *             required:
 *               - country
 *               - totalAmount
 *     responses:
 *       200:
 *         description: Calculated shipment charge
 *       400:
 *         description: Bad request
 *       404:
 *         description: No shipment charge found
 */
router.post(
  '/calculate',
  validateRequest(calculateShipmentChargeSchema),
  calculateShipmentCharge
);
module.exports = router;
