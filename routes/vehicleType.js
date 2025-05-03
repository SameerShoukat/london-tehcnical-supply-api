const express = require('express');
const router = express.Router();
const {
  create,
  getAll,
  getOne,
  updateOne,
  deleteOne,
  vehicleTypeDropdown
} = require('../controllers/vehicleType');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schema
const vehicleTypeSchema = Joi.object({
  name: Joi.string().required().min(3).max(100)
});

/**
 * @openapi
 * '/api/vehicle-type':
 *   get:
 *     tags:
 *       - VehicleType
 *     summary: Get all vehicle types
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         required: false
 *         description: Pagination offset
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of vehicle types
 */
router.get('/', authorize('stock', 'view'), getAll);

/**
 * @openapi
 * '/api/vehicle-type/dropdown':
 *   get:
 *     tags:
 *       - VehicleType
 *     summary: Get vehicle type dropdown
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Label/value list for dropdowns
 */
router.get('/dropdown', authorize('stock', 'view'), vehicleTypeDropdown);

/**
 * @openapi
 * '/api/vehicle-type/{id}':
 *   get:
 *     tags:
 *       - VehicleType
 *     summary: Get a single vehicle type
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: VehicleType ID
 *     responses:
 *       200:
 *         description: VehicleType object
 *       404:
 *         description: Not found
 */
router.get('/:id', authorize('stock', 'view'), getOne);

/**
 * @openapi
 * '/api/vehicle-type':
 *   post:
 *     tags:
 *       - VehicleType
 *     summary: Create a new vehicle type
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Truck"
 *     responses:
 *       201:
 *         description: VehicleType created
 *       409:
 *         description: Conflict (already exists)
 */
router.post('/', authorize('stock', 'manage'), validateRequest(vehicleTypeSchema), create);

/**
 * @openapi
 * '/api/vehicle-type/{id}':
 *   put:
 *     tags:
 *       - VehicleType
 *     summary: Update a vehicle type
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: VehicleType ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "SUV"
 *     responses:
 *       200:
 *         description: VehicleType updated
 *       404:
 *         description: Not found
 */
router.put('/:id', authorize('stock', 'manage'), validateRequest(vehicleTypeSchema), updateOne);

/**
 * @openapi
 * '/api/vehicle-type/{id}':
 *   delete:
 *     tags:
 *       - VehicleType
 *     summary: Soft-delete a vehicle type
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: VehicleType ID
 *     responses:
 *       200:
 *         description: VehicleType deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', authorize('stock', 'delete'), deleteOne);

module.exports = router;
