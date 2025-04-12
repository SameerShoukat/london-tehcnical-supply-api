const express = require("express");
const router = express.Router();
const {
  createTag,
  getAllTags,
  getOneTag,
  updateOneTag,
  deleteOneTag,
  tagsDropdown,
  getActiveTags,
  updateStatus,
} = require("../controllers/productTags");
const upload = require("../utils/upload");
const { authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validation");
const Joi = require("joi");

const tagSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(null, ""),
});

const productTagValidationSchema = Joi.object({
  status: Joi.boolean().required(),
  tagId: Joi.string().required(),
});

/**
 * @openapi
 * '/api/productTags/list':
 *   get:
 *     tags:
 *       - ProductTags
 *     summary: Get active product tags
 *     responses:
 *       200:
 *         description: Active tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Activated tags retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid"
 *                       name:
 *                         type: string
 *                         example: "Tag Name"
 *                       slug:
 *                         type: string
 *                         example: "tag-name"
 *                       image:
 *                         type: string
 *                         example: "image.png"
 *                       description:
 *                         type: string
 *                         example: "Tag description"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Not Found
 */
router.get("/list", getActiveTags);

/**
 * @openapi
 * '/api/productTags/status':
 *   post:
 *     tags:
 *       - Product
 *     summary: Create product tag with custom status
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tagId:
 *                 type: string
 *                 example: "jfjfjf999"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product tag created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "uuid"
 *                     name:
 *                       type: string
 *                       example: "Tag Name"
 *                     slug:
 *                       type: string
 *                       example: "tag-name"
 *                     image:
 *                       type: string
 *                       example: "image.png"
 *                     description:
 *                       type: string
 *                       example: "Tag description"
 *                     status:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Not Found
 */
router.post(
  "/status",
  authorize("stock", "manage"),
  validateRequest(productTagValidationSchema),
  updateStatus
);

/**
 * @openapi
 * '/api/productTags':
 *   get:
 *     tags:
 *       - ProductTags
 *     summary: Get product all tag
 *     security:
 *       - Bearer: []  # Reference to the security scheme
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
 *                   example: "uuid"
 *                 name:
 *                   type: string
 *                   example: "Tag Name"
 *                 slug:
 *                   type: string
 *                   example: "tag-name"
 *                 image:
 *                   type: string
 *                   example: "image.png"
 *                 description:
 *                   type: string
 *                   example: "Tag description"
 *       404:
 *         description: Not Found
 */
router.get("/", authorize("stock", "view"), getAllTags);

/**
 * @openapi
 * '/api/productTags/dropdown':
 *   get:
 *     tags:
 *       - ProductTags
 *     summary: Get product tags dropdown
 *     security:
 *       - Bearer: []  # Reference to the security scheme
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
 *                   label:
 *                     type: string
 *                     example: "Tag Name"
 *                   value:
 *                     type: string
 *                     example: "uuid"
 *       404:
 *         description: Not Found
 */
router.get("/dropdown", authorize("stock", "view"), tagsDropdown);

/**
 * @openapi
 * '/api/productTags/{id}':
 *   get:
 *     tags:
 *       - ProductTags
 *     summary: Get product tag
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the product tag
 *         required: true
 *         schema:
 *           type: string
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
 *                   example: "uuid"
 *                 name:
 *                   type: string
 *                   example: "Tag Name"
 *                 slug:
 *                   type: string
 *                   example: "tag-name"
 *                 image:
 *                   type: string
 *                   example: "image.png"
 *                 description:
 *                   type: string
 *                   example: "Tag description"
 *       404:
 *         description: Not Found
 */
router.get("/:id", authorize("stock", "view"), getOneTag);

/**
 * @openapi
 * '/api/productTags':
 *   post:
 *     tags:
 *       - ProductTags
 *     summary: Create product tag
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
 *                 example: '{"name": "Tag Name", "description": "This is a tag description"}'
 *     responses:
 *       200:
 *         description: Success - The product tag was created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "uuid"
 *                 name:
 *                   type: string
 *                   example: "Tag Name"
 *       404:
 *         description: Not Found
 */
router.post(
    "/",
    authorize("stock", "manage"),
    upload.single("file"),
    validateRequest(tagSchema, true),
    createTag
  );
  
  /**
   * @openapi
   * '/api/productTags/{id}':
   *   put:
   *     tags:
   *       - ProductTags
   *     summary: Update product tag
   *     security:
   *       - Bearer: []  # Reference to the security scheme
   *     parameters:
   *       - name: id
   *         in: path
   *         description: ID of the product tag
   *         required: true
   *         schema:
   *           type: string
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
   *                 example: '{"name": "Tag Name",  "description": "Updated tag description"}'
   *     responses:
   *       200:
   *         description: Success - The product tag was updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: "uuid"
   *                 name:
   *                   type: string
   *                   example: "Tag Name"
   *       404:
   *         description: Not Found
   */
  router.put(
    "/:id",
    authorize("stock", "manage"),
    upload.single("file"),
    validateRequest(tagSchema, true),
    updateOneTag
  );
  

/**
 * @openapi
 * '/api/productTags/{id}':
 *   delete:
 *     tags:
 *       - ProductTags
 *     summary: Delete product tag
 *     security:
 *       - Bearer: []  # Reference to the security scheme
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the product tag
 *         required: true
 *         schema:
 *           type: string
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
 *                   example: "uuid"
 *                 name:
 *                   type: string
 *                   example: "Tag Name"
 *                 slug:
 *                   type: string
 *                   example: "tag-name"
 *                 image:
 *                   type: string
 *                   example: "image.png"
 *                 description:
 *                   type: string
 *                   example: "Tag description"
 *       404:
 *         description: Not Found
 */
router.delete("/:id", authorize("stock", "delete"), deleteOneTag);

/**
 * @openapi
 * '/api/productTags/{id}/status':
 *   put:
 *     tags:
 *       - ProductTags
 *     summary: Update product tag status
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the product tag
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Tag not found
 */
router.put(
  "/:id/status",
  authorize("stock", "manage"),
  validateRequest(Joi.object({ status: Joi.boolean().required() })),
  updateStatus
);

module.exports = router;
