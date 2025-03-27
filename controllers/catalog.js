const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const Catalog = require('../models/catalog');
const User = require('../models/users');

// Create a new catalog
const create = async (req, res, next) => {
  try {

      const payload =  typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      payload['images'] = req?.files?.length > 0  ? req.files.map(file => file.path) : [];
      payload['userId'] = req.user.id;

      // Check if the user exists (including soft-deleted ones)
      const existingData = await Catalog.findOne({
          paranoid: false,
          where: { slug: createSlug(payload.name) },
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted with new data
              await existingData.restore();
              // Update the existing with new data
              await existingData.update(payload);
              
              return res.status(201).json(message(true, 'Catalog created successfully', existingData));
          } else {
              throw boom.conflict('Catalog already exists with this name');
          }
      }
      
      const catalog = await Catalog.create(payload);
      return res.status(201).json(message(true, 'Catalog created successfully', catalog));

  } catch (error) {
      next(error);
  }
};

// Get all catalog with optional filtering
const getAll = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;

    // count
    const count = await Catalog.count();

    // Get the paginated rows
    const rows = await Catalog.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset,
    });

    
    
    return res.status(200).json(message(true, 'Catalog retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};


// Get a single catalog by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const catalog = await Catalog.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        });
        if (!catalog) throw boom.notFound('Catalog not found');
        return res.status(200).json(message(true, 'Catalog retrieved successfully', catalog));
    } catch (error) {
      next(error);
    }
};

// Update a catalog by ID
const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        const images = req?.files?.length > 0  ? req.files.map(file => file.path) : [];
        const payload =  typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        payload['userId'] = req.user.id;

        if(images.length > 0) payload.images = images;
        
        const catalog = await Catalog.findByPk(id);
        if (!catalog) throw boom.notFound('Catalog not found');

        // Update the catalog
        await catalog.update(payload);

        return res.status(200).json(message(true, 'Catalog updated successfully', catalog));

    } catch (error) {
      next(error);
    }
};

// Delete a catalog by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const catalog = await Catalog.findByPk(id);

        if (!catalog) {
            throw boom.notFound('Catalog not found');
        }

        await catalog.destroy(); //soft deleted

        return res.status(200).json(message(true, 'Catalog deleted successfully'));
    } catch (error) {
      next(error);
    }
};

const catalogDropdown = async (req, res, next) => {
  try {
    const catalogs = await Catalog.findAll({
      attributes: [['name', 'label'], ['id', 'value']]
    });
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', catalogs));
  } catch (error) {
    next(error);
  }
}


const catalogList = async (req, res, next) => {
  try {

    const { offset = 0, pageSize = 10 } = req.query;

    // Get the paginated rows
    const rows = await Catalog.findAll({
      attributes: [['name', 'label'], ['id', 'value'], ['slug', 'slug'], ['images', 'images'], ['productCount', 'count']],
      order: [['name', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset,
    });

    return res.status(200).json(message(true, 'Catalog retrieved successfully', rows));
  } catch (error) {
    next(error);
  }
}


module.exports = {
    create,
    getAll,
    updateOne,
    getOne,
    deleteOne,
    catalogDropdown,
    catalogList
};