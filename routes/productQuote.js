// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createQuote,
  getAllQuotes,
  getOneQuote,
  updateOneQuote,
  deleteOneQuote,
  updateQuoteStatus,
  getUserQuotes
} = require('../controllers/productQuote');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const quoteSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  email: Joi.string().email().required(),
  productId: Joi.string().required(),
  message: Joi.string().required().min(10).max(1000),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20),
});



/**
 * @openapi
 * '/api/quotes':
 *  get:
 *     tags:
 *     - Quotes
 *     summary: Get all product quotes
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Page number for pagination
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
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                 message:
 *                   type: string
 *                   example: "I'm interested in this product"
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 status:
 *                   type: string
 *                   enum: [pending, contacted, completed, rejected]
 *                   example: "pending"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not Found
 */
router.get('/', authorize('stock', 'view'), getAllQuotes);

/**
 * @openapi
 * '/api/quotes/{id}':
 *  get:
 *     tags:
 *     - Quotes
 *     summary: Get one product quote
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product quote
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
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                 message:
 *                   type: string
 *                   example: "I'm interested in this product"
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 status:
 *                   type: string
 *                   enum: [pending, contacted, completed, rejected]
 *                   example: "pending"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not Found
 */
router.get('/:id', authorize('stock', 'view'), getOneQuote);

/**
 * @openapi
 * '/api/quotes':
 *   post:
 *     tags:
 *       - Quotes
 *     summary: Create quote request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, productId, message]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               productId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: "I'm interested in this product and would like more information"
 *               phone:
 *                 type: string
 *                 pattern: ^[0-9+\-\s()]+$
 *                 minLength: 10
 *                 maxLength: 20
 *                 example: "+1-234-567-8900"
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
 *                 email:
 *                   type: string
 *                   format: email
 *                 phone:
 *                   type: string
 *                 message:
 *                   type: string
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [pending, contacted, completed, rejected]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not Found
 */
router.post('/', validateRequest(quoteSchema), createQuote);

/**
 * @openapi
 * '/api/quotes/{id}':
 *  put:
 *     tags:
 *     - Quotes
 *     summary: Update one product quote
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product quote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, productId, message]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               productId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: "I'm interested in this product and would like more information"
 *               phone:
 *                 type: string
 *                 pattern: ^[0-9+\-\s()]+$
 *                 minLength: 10
 *                 maxLength: 20
 *                 example: "+1-234-567-8900"
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
 *                 email:
 *                   type: string
 *                   format: email
 *                 phone:
 *                   type: string
 *                 message:
 *                   type: string
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [pending, contacted, completed, rejected]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not Found
 */
router.put('/:id', authorize('stock', 'view'), validateRequest(quoteSchema), updateOneQuote);

/**
 * @openapi
 * '/api/quotes/{id}':
 *  delete:
 *     tags:
 *     - Quotes
 *     summary: Delete one product quote
 *     security:
 *     - Bearer: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product quote
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
 *                 message:
 *                   type: string
 *       404:
 *         description: Not Found
 */
router.delete('/:id', authorize('stock', 'manage'), deleteOneQuote);

/**
 * @openapi
 * '/api/quotes/{id}/status':
 *  patch:
 *     tags:
 *     - Quotes
 *     summary: Update quote status
 *     security:
 *     - Bearer: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product quote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, contacted, completed, rejected]
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */
router.patch('/:id/status', authorize('stock', 'manage'), updateQuoteStatus);

/**
 * @openapi
 * '/api/quotes/user':
 *  get:
 *     tags:
 *     - Quotes
 *     summary: Get logged in user's quotes
 *     security:
 *     - Bearer: []
 *     parameters:
 *     - name: offset
 *       in: query
 *       schema:
 *         type: integer
 *       description: Pagination offset
 *     - name: pageSize
 *       in: query
 *       schema:
 *         type: integer
 *       description: Number of items per page
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/user', authorize(), getUserQuotes);




module.exports = router;