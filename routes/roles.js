const express = require('express');
const Joi = require("joi");
const router = express.Router();

const { 
  create, 
  getAll, 
  updateOne, 
  getOne,
  deleteOne 
} = require('../controllers/roles');

const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');

const payloadSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Role name is required'
  }),
  accounts: Joi.array().items(
    Joi.string().valid('read', 'manage', 'delete')
  ).optional().messages({
    'any.only': 'Invalid account permission'  // Changed from 'any.valid'
  }),
  stocks: Joi.array().items(
    Joi.string().valid('read', 'manage', 'delete')
  ).optional().messages({
    'any.only': 'Invalid stock permission'  // Fixed message and error key
  }),
  orders: Joi.array().items(
    Joi.string().valid('read', 'manage', 'delete')
  ).optional().messages({
    'any.only': 'Invalid order permission'  // Fixed message and error key
  }),
  finance: Joi.array().items(
    Joi.string().valid('read', 'manage', 'delete')
  ).optional().messages({
    'any.only': 'Invalid finance permission'  // Fixed message and error key
  })
});



/**
 * @openapi
 * '/api/role/all':
 *  get:
 *     tags:
 *     - ROLE
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
router.get('/all', protect, getAll);

/**
 * @openapi
 * '/api/role/{id}':
 *  get:
 *     tags:
 *     - ROLE
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
router.get('/:id', protect, getOne);

/**
 * @openapi
 * '/api/role':
 *  post:
 *     tags:
 *     - ROLE
 *     summary: Create a new role
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: finance
 *               accounts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'manage', 'delete']
 *               stocks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'manage', 'delete']
 *               orders:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'manage', 'delete']
 *               finance:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'manage', 'delete']
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
router.post('', protect, validateRequest(payloadSchema), create);

/**
 * @openapi
 * '/api/users/{id}':
 *  put:
 *     tags:
 *     - ROLE
 *     summary: Update role information
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: ID of the account
 *       schema:
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: finance
 *               accounts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'manage', 'delete']
 *               stocks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'manage', 'delete']
 *               orders:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'manage', 'delete']
 *               finance:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'manage', 'delete']
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
router.put('/:id', protect, updateOne);

/**
 * @openapi
 * '/api/role/{id}':
 *  delete:
 *     tags:
 *     - ROLE
 *     summary: Delete Role
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
router.delete('/:id', protect, deleteOne);




module.exports = router;