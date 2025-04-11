const { createSlug, message } = require("../utils/hook");
const boom = require("@hapi/boom");
const _ = require("lodash");
const ProductTags = require('../models/products/tags');

// Create a new tag
const createTag = async (req, res, next) => {
  try {
    // If payload comes as a string, parse it; otherwise use it directly
    const payload = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    payload['image'] = req?.file?.path || {};

    console.log(payload)
    
    
    // Generate a slug from the name if not provided manually
    if (payload?.name) {
      payload.slug = createSlug(payload.name);
    }

    // Check if a tag with the same name (or slug) exists (including soft-deleted ones)
    const existingData = await ProductTags.findOne({
      paranoid: false,
      where: { name: payload.name },
    });

    if (existingData) {
      if (existingData.deletedAt) {
        // Restore soft-deleted record and update with new data
        await existingData.restore();
        await existingData.update(payload);
        return res.status(201).json(message(true, 'Product tag created successfully', existingData));
      } else {
        throw boom.conflict('Product tag already exists with this name');
      }
    }

    // Create the new tag
    const tag = await ProductTags.create(payload);
    return res.status(201).json(message(true, 'Product tag created successfully', tag));
  } catch (error) {
    next(error);
  }
};

// Get all tags with optional pagination filtering
const getAllTags = async (req, res, next) => {
  try {
    // Pagination parameters (defaults provided)
    const { offset = 0, pageSize = 10 } = req.query;

    // Get total count of tags
    const count = await ProductTags.count();

    // Retrieve paginated tags ordered by creation date (newest first)
    const rows = await ProductTags.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset,
    });

    return res.status(200).json(message(true, 'Product tags retrieved successfully', rows, count));
  } catch (error) {
    next(error);
  }
};

// Get a single tag by ID
const getOneTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tag = await ProductTags.findByPk(id);
    if (!tag) throw boom.notFound('Product tag not found');
    return res.status(200).json(message(true, 'Product tag retrieved successfully', tag));
  } catch (error) {
    next(error);
  }
};

// Update a tag by ID
const updateOneTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Parse payload if it's a string
    const payload = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    if(req?.file?.path){
        payload['image'] = req?.file?.path || {};
    }
    // If a name is provided update the slug as well
    if (payload.name) {
      payload.slug = createSlug(payload.name);
    }

    const tag = await ProductTags.findByPk(id);
    if (!tag) throw boom.notFound('Product tag not found');

    // Update the tag record with the new data
    await tag.update(payload);
    return res.status(200).json(message(true, 'Product tag updated successfully', tag));
  } catch (error) {
    next(error);
  }
};

// Delete a tag by ID (soft-delete)
const deleteOneTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tag = await ProductTags.findByPk(id);
    if (!tag) throw boom.notFound('Product tag not found');

    await tag.destroy(); // This performs a soft delete if your model is set up with paranoid mode.
    return res.status(200).json(message(true, 'Product tag deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// Get a dropdown list of tags
const tagsDropdown = async (req, res, next) => {
  try {
    // Return only id and name for dropdown lists (aliasing fields as needed)
    const tags = await ProductTags.findAll({
      attributes: [['name', 'label'], ['id', 'value']],
    });
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', tags));
  } catch (error) {
    next(error);
  }
};

const getActiveTags = async (req, res, next) => {
    try {
      const activeTags = await ProductTags.findAll({
        where: { status: true },
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json(message(true, 'Activated tags retrieved successfully', activeTags));
    } catch (error) {
      next(error);
    }
  };

/**
 * Update the status of a tag by its ID
 * @param {Object} req.body - Contains tagId and status
 */
const updateStatus = async (req, res, next) => {
    try {
      // Parse payload (handle stringified JSON if necessary)
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { tagId, status } = payload;

      // Find the tag
      const tag = await ProductTags.findByPk(tagId);
      if (!tag) throw boom.notFound('Product tag not found');

      // Update the status
      await tag.update({ status });
      
      return res.status(200).json(message(true, 'Product tag status updated successfully', tag));
    } catch (error) {
      next(error);
    }
};


module.exports = {
  createTag,
  getAllTags,
  getOneTag,
  updateOneTag,
  deleteOneTag,
  tagsDropdown,
  getActiveTags,
  updateStatus

};
