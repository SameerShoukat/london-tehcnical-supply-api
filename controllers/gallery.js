const { createSlug, message } = require("../utils/hook");
const boom = require("@hapi/boom");
const _ = require("lodash");
const {Gallery} = require('../models/gallery');

// Create a new tag
const createGallery = async (req, res, next) => {
  try {
    // If payload comes as a string, parse it; otherwise use it directly
    const payload = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    payload['image'] = req?.file?.path || {};

    // Create the new tag
    const tag = await Gallery.create(payload);
    return res.status(201).json(message(true, 'Gallery created successfully', tag));
  } catch (error) {
    next(error);
  }
};

// Get all tags with optional pagination filtering
const getAllGallery = async (req, res, next) => {
  try {
    const {type, status} = req.query
    let where = {}
    if(type) where.type = type
    if(status) where.status =  status
    // Pagination parameters (defaults provided)
    const { offset = 0, pageSize = 10 } = req.query;

    // Get total count of tags
    const count = await Gallery.count();

    // Retrieve paginated tags ordered by creation date (newest first)
    const rows = await Gallery.findAll({
      where : where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset,
    });

    return res.status(200).json(message(true, 'Gallery retrieved successfully', rows, count));
  } catch (error) {
    next(error);
  }
};

// Get a single tag by ID
const getOneGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tag = await Gallery.findByPk(id);
    if (!tag) throw boom.notFound('Gallery not found');
    return res.status(200).json(message(true, 'Gallery retrieved successfully', tag));
  } catch (error) {
    next(error);
  }
};


const deleteOneGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findByPk(id);
    if (!gallery) throw boom.notFound('Gallery not found');

    await gallery.destroy();
    return res.status(200).json(message(true, 'Gallery deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const getActiveGallery = async (req, res, next) => {
    try {
      const {type} = req.query
      const where = {status : true}
      if(type) where.type = type;
      const activeGallery = await Gallery.findAll({
        where: where,
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json(message(true, 'Activated gallery retrieved successfully', activeGallery));
    } catch (error) {
      next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { galleryId, status } = payload;


      const gallery = await Gallery.findByPk(galleryId);
      if (!gallery) throw boom.notFound('Gallery not found');

      await gallery.update({ status });
      
      return res.status(200).json(message(true, 'Gallery status updated successfully', gallery));
    } catch (error) {
      next(error);
    }
};


module.exports = {
  createGallery,
  getAllGallery,
  getOneGallery,
  deleteOneGallery,
  getActiveGallery,
  updateStatus
};
