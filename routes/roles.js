const express = require('express');
const Joi = require("joi");
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/users');

const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');

const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});


/**
 * @openapi
 * '/api/users/register':
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
 * '/api/users/login':
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
 * '/api/users/profile':
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
router.get('/profile', protect, getUserProfile);
/**
 * @openapi
 * '/api/users/{id}':
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
router.put('/:id', protect, updateUserProfile);

/**
 * @openapi
 * '/api/users/profile':
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
router.put('/profile', protect, updateUserProfile);

module.exports = router;