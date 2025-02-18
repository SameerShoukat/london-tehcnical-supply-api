// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
getCountries
} = require('../controllers/constant');
const { authorize } = require('../middleware/auth');

/**
 * @openapi
 * '/api/constant/countries':
 *  get:
 *     tags:
 *     - Constant
 *     summary: Get all countries
 *     security:
 *     - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *         required: false
 *         description: Name of the page to filter countries
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
 *                   example: "gdgdgdgdcbcbcb"
 *                 name:
 *                   type: string
 *                   example: ABCD
 *                 slug:
 *                   type: string
 *                   example: ABCD
 *       404:
 *         description: Not Found
 */
router.get('/countries', authorize('', '', true), getCountries);


module.exports = router;