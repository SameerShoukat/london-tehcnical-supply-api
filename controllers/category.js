const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const Category = require('../models/category');
const User = require('../models/users');
const Catalog = require('../models/catalog');

// Create a new category
const create = async (req, res, next) => {
  try {

      const payload =  typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      payload['images'] = req?.files?.length > 0  ? req.files.map(file => file.path) : [];
      payload['userId'] = req.user.id;

      // Check if the user exists (including soft-deleted ones)
      const existingData = await Category.findOne({
          paranoid: false,
          where: { slug: createSlug(payload.name) },
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted with new data
              await existingData.restore();
              // Update the existing with new data
              await existingData.update(payload);
              
              return res.status(201).json(message(true, 'Category created successfully', existingData));
          } else {
              throw boom.conflict('Category already exists with this name');
          }
      }
      
      const category = await Category.create(payload);
      return res.status(201).json(message(true, 'Category created successfully', category));

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
    const count = await Category.count();

    // Get the paginated rows
    const rows = await Category.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });


      return res.status(200).json(message(true, 'Category retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};


// Get a single category by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: Catalog,
              as : 'catalog',
              attributes: ['id', 'name', 'images']
            }
          ]
        });
        if (!category) throw boom.notFound('Category not found');
        return res.status(200).json(message(true, 'Category retrieved successfully', category));
    } catch (error) {
      next(error);
    }
};

// Update a category by ID
const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        const images = req?.files?.length > 0  ? req.files.map(file => file.path) : [];
        const payload =  typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        payload['userId'] = req.user.id;

        if(images.length > 0) payload.images = images;
        
        const category = await Category.findByPk(id);
        if (!category) throw boom.notFound('Category not found');

        // Update the category
        await category.update(payload);

        return res.status(200).json(message(true, 'Category updated successfully', category));

    } catch (error) {
      next(error);
    }
};

// Delete a category by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            throw boom.notFound('Category not found');
        }

        await category.destroy(); //soft deleted

        return res.status(200).json(message(true, 'Category deleted successfully'));
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