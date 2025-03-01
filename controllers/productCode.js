const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const ProductCodes = require('../models/products/codes');
const User = require('../models/users');

// Create a new codes
const createCode = async (req, res, next) => {
  try {

      const payload =  typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      payload['userId'] = req.user.id;

      // Check if the user exists (including soft-deleted ones)
      const existingData = await ProductCodes.findOne({
          paranoid: false,
          where: { slug: createSlug(payload.name) },
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted with new data
              await existingData.restore();

              // Update the existing with new data
              await existingData.update(payload);
              
              return res.status(201).json(message(true, 'Product code created successfully', existingData));
          } else {
              throw boom.conflict('Product code already exists with this name');
          }
      }
      const codes = await ProductCodes.create(payload);
      return res.status(201).json(message(true, 'Product code created successfully', codes));

  } catch (error) {
      next(error);
  }
};
// Get all codes with optional filtering
const getAllCodes = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;
  
    // Get the total count of matching rows
    const count = await ProductCodes.count();

    // Get the paginated rows
    const rows = await ProductCodes.findAll({
        include: [
          {
            model: User,
            as : 'user',
            attributes: ['id', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(pageSize, 10),
        offset,
      });
  
      return res.status(200).json(message(true, 'Product codes retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};

// Get a single codes by ID
const getOneCode = async (req, res, next) => {
    try {
        const { id } = req.params;
        const codes = await ProductCodes.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        });
        if (!codes) throw boom.notFound('Product code not found');
        return res.status(200).json(message(true, 'Product code retrieved successfully', codes));
    } catch (error) {
      next(error);
    }
};

// Update a codes by ID
const updateOneCode = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payload =  typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        payload['userId'] = req.user.id;
        
        const codes = await ProductCodes.findByPk(id);
        if (!codes) throw boom.notFound('Product code not found');

        // Update the codes
        await codes.update(payload);

        return res.status(200).json(message(true, 'Product code updated successfully', codes));

    } catch (error) {
      next(error);
    }
};

// Delete a codes by ID
const deleteOneCode = async (req, res, next) => {
    try {
        const { id } = req.params;
        const codes = await ProductCodes.findByPk(id);
        
        if (!codes) {
            throw boom.notFound('Product code not found');
        }

        await codes.destroy(); //soft deleted

        return res.status(200).json(message(true, 'Product code deleted successfully'));
    } catch (error) {
      next(error);
    }
};

const codesDropdown = async (req, res, next) => {
  try {
    const codes = await ProductCodes.findAll({
      attributes: [['name', 'label'], ['id', 'value']],
    });
    
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', codes));
  } catch (error) {
    next(error);
  }
}



module.exports = {
    createCode,
    getAllCodes,
    updateOneCode,
    getOneCode,
    deleteOneCode,
    codesDropdown
};