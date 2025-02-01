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
  deleteOne
} = require('../controllers/users');
const { authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');

const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  roleId : Joi.string().optional(),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});




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
 *              password:
 *                type: string
 *                default: adm%%4in
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
 *                  role:
 *                    example: "admin"
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.post('/register', validateRequest(userSchema), registerUser);

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
 *                default: adm%%4in
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
 *                  role:
 *                    example: "admin"
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
 *                  firstName:
 *                    example : "Harris"
 *                  lastName:
 *                    example : "Jordan"
 *                  email:
 *                    example: "harrisjordan@gmail.com"
 *                  role:
 *                    example: "admin"
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
 * '/api/user/all':
 *  get:
 *     tags:
 *     - USER
 *     summary: Get all roles
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Name of the page to filter accounts
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
 *                  firstName:
 *                    example : "Harris"
 *                  lastName:
 *                    example : "Jordan"
 *                  email:
 *                    example: "harrisjordan@gmail.com"
 *                  role:
 *                    example: "admin"
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.get('/all', authorize('accounts', 'view'), getAll);

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
 *                  firstName:
 *                    example : "Harris"
 *                  lastName:
 *                    example : "Jordan"
 *                  email:
 *                    example: "harrisjordan@gmail.com"
 *                  role:
 *                    example: "admin"
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.get('/:id', authorize('accounts', 'view'), getOne);

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
 *                  firstName:
 *                    example : "Harris"
 *                  lastName:
 *                    example : "Jordan"
 *                  email:
 *                    example: "harrisjordan@gmail.com"
 *                  role:
 *                    example: "admin"
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
 *                  firstName:
 *                    example : "Harris"
 *                  lastName:
 *                    example : "Jordan"
 *                  email:
 *                    example: "harrisjordan@gmail.com"
 *                  role:
 *                    example: "admin"
 *                  jwtToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *                  refreshToken:
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTQxMjMwZWQyNGEwYWQ3YmRiNTNkNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5NjE2NzU5MSwiZXhwIjoxNjk2MTcwNTkxfQ.D7nN9Xo8f7uWflvIG73UItGKcaHRm5-NXQ-XNJJbOs4"
 *       404:
 *         description: not found
 */
router.put('/:id', authorize('accounts', 'manage'), updateUserProfile);



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
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "gdgdgdgdcbcbcb"
 *                   name:
 *                     type: string
 *                     example: "finance"
 *                   accounts:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ['read', 'manage', 'delete']
 *                   stocks:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ['read', 'manage', 'delete']
 *                   orders:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ['read', 'manage', 'delete']
 *                   finance:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ['read', 'manage', 'delete']
 *       404:
 *         description: Not Found
 */
router.delete('/:id', authorize('accounts', 'delete'), deleteOne);



module.exports = router;