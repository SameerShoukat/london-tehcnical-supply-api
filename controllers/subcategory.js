const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const SubCategory = require('../models/subCategory');
const User = require('../models/users');
const Category = require('../models/category');

// Create a new sub category
const create = async (req, res, next) => {
  try {

      const payload =  typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      payload['images'] = req?.files?.length > 0  ? req.files.map(file => file.path) : [];
      payload['userId'] = req.user.id;

      // Check if the user exists (including soft-deleted ones)
      const existingData = await SubCategory.findOne({
          paranoid: false,
          where: { slug: createSlug(payload.name) },
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted with new data
              await existingData.restore();

              // Update the existing with new data
              await existingData.update(payload);
              
              return res.status(201).json(message(true, 'SubCategory created successfully', existingData));
          } else {
              throw boom.conflict('SubCategory already exists with this name');
          }
      }
      
      const subCategory = await SubCategory.create(payload);
      return res.status(201).json(message(true, 'SubCategory created successfully', subCategory));

  } catch (error) {
      next(error);
  }
};

// Get all category with optional filtering
const getAll = async (req, res, next) => {
  try {

    const { pagination = 1, limit = 10 } = req.query;
    const offset = (parseInt(pagination, 10) - 1) * parseInt(limit, 10);

    // Get the total count of matching rows
    const count = await SubCategory.count();

    // Get the paginated rows
    const rows = await SubCategory.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });


      return res.status(200).json(message(true, 'SubCategory retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};


// Get a single subCategory by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subCategory = await SubCategory.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: Category,
              as : 'category',
              attributes: ['id', 'name', 'images']
            }
          ]
        });
        if (!subCategory) throw boom.notFound('SubCategory not found');
        return res.status(200).json(message(true, 'SubCategory retrieved successfully', subCategory));
    } catch (error) {
      next(error);
    }
};

// Update a subCategory by ID
const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        const images = req?.files?.length > 0  ? req.files.map(file => file.path) : [];
        const payload =  typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        payload['userId'] = req.user.id;

        if(images.length > 0) payload.images = images;
        
        const subCategory = await SubCategory.findByPk(id);
        if (!subCategory) throw boom.notFound('SubCategory not found');

        // Update the subCategory
        await subCategory.update(payload);

        return res.status(200).json(message(true, 'SubCategory updated successfully', subCategory));

    } catch (error) {
      next(error);
    }
};

// Delete a subCategory by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subCategory = await SubCategory.findByPk(id);

        if (!subCategory) {
            throw boom.notFound('SubCategory not found');
        }

        await subCategory.destroy(); //soft deleted

        return res.status(200).json(message(true, 'SubCategory deleted successfully'));
    } catch (error) {
      next(error);
    }
};


module.exports = {
    create,
    getAll,
    updateOne,
    getOne,
    deleteOne
};