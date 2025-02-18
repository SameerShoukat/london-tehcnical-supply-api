/**
 * @fileoverview This module defines the routes for user-related operations in the application.
 * It includes routes for user registration, login, profile retrieval and update, and user management.
 * The routes are documented using OpenAPI specifications for API documentation.
 * 
 * @requires express
 * @requires joi
 * @requires ../controllers/users
 * @requires ../middleware/auth
 * @requires ../middleware/validation
 * 
 * @module routes/users
 */
const express = require('express');
const Joi = require("joi");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  getAll,
  getOne,
  deleteOne,
  validateAccessToken,
  activateUser,
  deactivateUser,
  logout,
  getMyPermission
} = require('../controllers/users');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');

const permissionSchema = Joi.object({
  accounts: Joi.array().items(
    Joi.string().valid('view', 'manage', 'delete')
  ).optional().messages({
    'any.only': 'Invalid account permission'
  }),
  stocks: Joi.array().items(
    Joi.string().valid('view', 'manage', 'delete')
  ).optional().messages({
    'any.only': 'Invalid stock permission'  
  }),
  orders: Joi.array().items(
    Joi.string().valid('view', 'manage', 'delete')
  ).optional().messages({
    'any.only': 'Invalid order permission'  
  }),
  finance: Joi.array().items(
    Joi.string().valid('view', 'manage', 'delete')
  ).optional().messages({
    'any.only': 'Invalid finance permission'  
  })
});


const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const createSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  permissions : permissionSchema.required().messages({
    'any.required': 'Permissions are required'
  })
});

const refreshTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
})




/**
 * @openapi
 * '/api/user/register':
 *  post:
 *     tags:
 *     - USER
 *     summary: User register
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: admin@londontechnicalsupply.com
 *              permissions:
 *                type: object
 *                default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.post('/register', validateRequest(createSchema), registerUser);

/**
 * @openapi
 * '/api/user/login':
 *  post:
 *     tags:
 *     - USER
 *     summary: User login
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: admin@londontechnicalsupply.com
 *              password:
 *                type: string
 *                default: 1234
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.post('/login', validateRequest(userSchema), loginUser);

/**
 * @openapi
 * '/api/user/profile':
 *  get:
 *     tags:
 *     - USER
 *     summary: Get user profile information
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.get('/profile', authorize('', '', true), getUserProfile);

/**
 * @openapi
 * /api/user/permission:
 *   get:
 *     tags:
 *       - USER
 *     summary: Get user permission
 *     security:
 *       - Bearer: []
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
 *                       accounts: ["read", "manage"]
 *                       stocks: ["read"]
 *                       orders: ["manage", "delete"]
 *                       finance: ["read"]
 *       404:
 *         description: Not found
 */

router.get('/permission', authorize('', '', true), getMyPermission);

/**
 * @openapi
 * '/api/user/all':
 *  get:
 *     tags:
 *     - USER
 *     summary: Get all roles
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of items per page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: string
 *         required: false
 *         description: Cursor for pageSize
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.get('/all', authorize('setting', 'view'), getAll);

/**
 * @openapi
 * '/api/user/activate/{id}':
 *  get:
 *     tags:
 *     - USER
 *     summary: Make use Active
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the account
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.get('/activate/:id', authorize('setting', 'view'), activateUser);

/**
 * @openapi
 * '/api/user/deactivate/{id}':
 *  get:
 *     tags:
 *     - USER
 *     summary: Get all roles
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the account
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.get('/deactivate/:id', authorize('setting', 'view'), deactivateUser);

/**
 * @openapi
 * '/api/user/{id}':
 *  get:
 *     tags:
 *     - USER
 *     summary: Get role information
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the account
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.get('/:id', authorize('setting', 'view'), getOne);

/**
 * @openapi
 * '/api/user/profile':
 *  put:
 *     tags:
 *     - USER
 *     summary: Update user profile information
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *                default: Harris
 *              lastName:
 *                type: string
 *                default: Jordan
 *              phone:
 *                type: string
 *                default: 03123456789
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.put('/profile', authorize('', '', true), updateUserProfile);

/**
 * @openapi
 * '/api/user/{id}':
 *  put:
 *     tags:
 *     - USER
 *     summary: Get user profile information
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the account
 *       schema:
 *         type: string
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *                default: Harris
 *              lastName:
 *                type: string
 *                default: Jordan
 *              phone:
 *                type: string
 *                default: 03123456789
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.put('/:id', authorize('setting', 'manage'), updateUserProfile);

/**
 * @openapi
 * '/api/user/{id}':
 *  delete:
 *     tags:
 *     - USER
 *     summary: Delete User
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the account
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    example : "gdgdgdgdcbcbcb"
 *                  email:
 *                    example: "sameershoukat000@gmail.com"
 *                  permissions:
 *                    type: object
 *                    default:  {"accounts": ["read", "manage"],"stocks": ["read"],"orders": ["manage", "delete"],"finance": ["read"]}
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.delete('/:id', authorize('setting', 'delete'), deleteOne);

/**
 * @openapi
 * '/api/user/validate':
 *  post:
 *     tags:
 *     - USER
 *     summary: Validate refresh token
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - token
 *            properties:
 *              token:
 *                type: string
 *                default: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                auth:
 *                  type: boolean
 *                  example: true
 *       400:
 *         description: Invalid token
 */
router.post('/validate', validateRequest(refreshTokenSchema), validateAccessToken);

/**
 * @openapi
 * '/api/user/logout':
 *  post:
 *     tags:
 *     - USER
 *     summary: Validate refresh token
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - token
 *            properties:
 *              token:
 *                type: string
 *                default: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid token
 */
router.post('/logout', authorize('', '', true), validateRequest(refreshTokenSchema), logout);


module.exports = router;