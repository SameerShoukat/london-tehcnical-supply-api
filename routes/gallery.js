const express = require("express");
const router = express.Router();
const {
  createGallery,
  getAllGallery,
  getOneGallery,
  deleteOneGallery,
  getActiveGallery,
  updateStatus
} = require("../controllers/gallery");
const upload = require("../utils/upload");
const { authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validation");
const Joi = require("joi");
const {TYPE} = require('../models/gallery');


const validationSchema = Joi.object({
  type: Joi.string().required().valid(...Object.values(TYPE))
});

const galleryStatusValidationSchema = Joi.object({
  status: Joi.boolean().required(),
  galleryId: Joi.string().required(),
});

/**
 * @openapi
 * '/api/gallery/list':
 *   get:
 *     tags:
 *       - Gallery
 *     summary: Get active gallery
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Type of the gallery
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: true / false
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active gallery retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Active gallery retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid"
 *                       tag:
 *                         type: string
 *                         example: "Brand"
 *                       image:
 *                         type: string
 *                         example: "image.png"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Not Found
 */
router.get("/list", getActiveGallery);

/**
 * @openapi
 * '/api/gallery/status':
 *   post:
 *     tags:
 *       - Gallery
 *     summary: update gallery status image
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               galleryId:
 *                 type: string
 *                 example: "jfjfjf999"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Gallery status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gallery status updated successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid"
 *                       tag:
 *                         type: string
 *                         example: "Brand"
 *                       image:
 *                         type: string
 *                         example: "image.png"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Not Found
 */
router.post(
  "/status",
  authorize("account", "manage"),
  validateRequest(galleryStatusValidationSchema),
  updateStatus
);

/**
 * @openapi
 * '/api/gallery':
 *   get:
 *     tags:
 *       - Gallery
 *     summary: Get all gallery items
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Type of the gallery
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: true or false
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gallery items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gallery items retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid"
 *                       tag:
 *                         type: string
 *                         example: "Brand"
 *                       image:
 *                         type: string
 *                         example: "image.png"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Not Found
 */
router.get("/", authorize("stock", "view"), getAllGallery);


/**
 * @openapi
 * '/api/gallery':
 *   post:
 *     tags:
 *       - Gallery
 *     summary: Create gallery
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *               data:
 *                 type: string
 *                 description: JSON string containing the payload. 
 *                 example: '{"type": "brand"}'
 *     responses:
 *       200:
 *         description: Gallery created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gallery created successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid"
 *                       tag:
 *                         type: string
 *                         example: "Brand"
 *                       image:
 *                         type: string
 *                         example: "image.png"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Not Found
 */
router.post(
    "/",
    authorize("account", "manage"),
    upload.single("file"),
    validateRequest(validationSchema, true),
    createGallery
  );
  
/**
 * @openapi
 * '/api/gallery/{id}':
 *   delete:
 *     tags:
 *       - Gallery
 *     summary: Delete gallery item
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the gallery item
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gallery item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gallery item deleted successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid"
 *                       tag:
 *                         type: string
 *                         example: "Brand"
 *                       image:
 *                         type: string
 *                         example: "image.png"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Not Found
 */
router.delete("/:id", authorize("account", "delete"), deleteOneGallery);

module.exports = router;