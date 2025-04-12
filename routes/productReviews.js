// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createReview,
  getAllReviews,
  getOneReview,
  updateOneReview,
  deleteOneReview,
  updateReviewStatus,
  getProductRating,
  reviewList
} = require('../controllers/productReview');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  name: Joi.string().allow(''),
  email: Joi.string().email().allow(''),
  title: Joi.string().allow(''),
  content: Joi.string().required(),
  productId: Joi.string().guid({ version: 'uuidv4' }).required()
});


/**
 * @openapi
 * '/api/reviews':
 *  get:
 *     tags:
 *     - Reviews
 *     summary: Get all product reviews
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
 *                 rating:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 5
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not Found
 */
router.get('/', authorize('stock', 'view'), getAllReviews);

/**
 * @openapi
 * '/api/reviews/list/{id}':
 *  get:
 *     tags:
 *     - Reviews
 *     summary: Get product reviews
 *     parameters:
 *     - name: id
 *       in: path
 *       schema:
 *         type: string
 *         format: uuid
 *       required: true
 *       description: Product ID to get reviews for
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   rating:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   productId:
 *                     type: string
 *                     format: uuid
 *                   status:
 *                     type: string
 *                     enum: [pending, approved, rejected]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Not Found
 */
router.get('/list/:id', reviewList);

/**
 * @openapi
 * '/api/reviews/{id}':
 *  get:
 *     tags:
 *     - Reviews
 *     summary: Get one product reviews
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product review
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
 *                 rating:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 5
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not Found
 */
router.get('/:id', authorize('stock', 'view'), getOneReview);

/**
 * @openapi
 * '/api/reviews':
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, email, title, content, productId]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 example: "Great Product!"
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "This product exceeded my expectations..."
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
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
 *                 rating:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 5
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not Found
 */
router.post('/',  validateRequest(reviewSchema), createReview);

/**
 * @openapi
 * '/api/reviews/{id}':
 *  put:
 *     tags:
 *     - Reviews
 *     summary: Update one product review
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, email, title, content, productId]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 example: "Great Product!"
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "This product exceeded my expectations..."
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
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
 *                 rating:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 5
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 productId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not Found
 */
router.put('/:id', authorize('stock', 'view'), validateRequest(reviewSchema), updateOneReview);

/**
 * @openapi
 * '/api/reviews/{id}':
 *  delete:
 *     tags:
 *     - Reviews
 *     summary: Delete one product review
 *     security:
 *     - Bearer: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product review
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
router.delete('/:id', authorize('stock', 'manage'), deleteOneReview);

/**
 * @openapi
 * '/api/reviews/{id}/status':
 *  patch:
 *     tags:
 *     - Reviews
 *     summary: Update review status
 *     security:
 *     - Bearer: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the product review
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
 *                 enum: [pending', approved, rejected]
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 */
router.patch('/:id/status', authorize('stock', 'manage'), updateReviewStatus);

/**
 * @openapi
 * '/api/reviews/product/{productId}/rating':
 *  get:
 *     tags:
 *     - Reviews
 *     summary: Get product rating statistics
 *     parameters:
 *     - name: productId
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
 *                 averageRating:
 *                   type: string
 *                   example: "4.5"
 *                 totalReviews:
 *                   type: integer
 *                   example: 10
 *       404:
 *         description: Not Found
 */
router.get('/product/:productId/rating', getProductRating);





module.exports = router;