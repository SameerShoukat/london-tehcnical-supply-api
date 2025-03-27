const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const Attribute = require('../models/products/attributes');
const User = require('../models/users');

// Create a new attribute
const create = async (req, res, next) => {
  try {

      const payload =  typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      payload['userId'] = req.user.id;

      // Check if the user exists (including soft-deleted ones)
      const existingData = await Attribute.findOne({
          paranoid: false,
          where: { slug: createSlug(payload.name) },
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted with new data
              await existingData.restore();
              // Update the existing with new data
              await existingData.update(payload);
              
              return res.status(201).json(message(true, 'Attribute created successfully', existingData));
          } else {
              throw boom.conflict('Attribute already exists with this name');
          }
      }
      const attribute = await Attribute.create(payload);
      return res.status(201).json(message(true, 'Attribute created successfully', attribute));

  } catch (error) {
      next(error);
  }
};
// Get all attribute with optional filtering
const getAll = async (req, res, next) => {
  try {
    
    const { offset = 0, pageSize = 10 } = req.query;
  
    // Get the total count of matching rows
    const count = await Attribute.count();

    // Get the paginated rows
    const rows = await Attribute.findAll({
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
  
      return res.status(200).json(message(true, 'Attributes retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};

// Get a single attribute by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attribute = await Attribute.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        });
        if (!attribute) throw boom.notFound('Attribute not found');
        return res.status(200).json(message(true, 'Attribute retrieved successfully', attribute));
    } catch (error) {
      next(error);
    }
};

// Update a attribute by ID
const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payload =  typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        payload['userId'] = req.user.id;
        
        const attribute = await Attribute.findByPk(id);
        if (!attribute) throw boom.notFound('Attribute not found');

        // Update the attribute
        await attribute.update(payload);

        return res.status(200).json(message(true, 'Attribute updated successfully', attribute));

    } catch (error) {
      next(error);
    }
};

// Delete a attribute by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attribute = await Attribute.findByPk(id);
        if(['brand', 'vehicle_type'].includes(attribute.slug)) throw boom.badRequest("You cant delete this attribute")

        if (!attribute) {
            throw boom.notFound('Attribute not found');
        }

        await attribute.destroy(); //soft deleted

        return res.status(200).json(message(true, 'Attribute deleted successfully'));
    } catch (error) {
      next(error);
    }
};

const attributeDropdown = async (req, res, next) => {
  try {
    const attributes = await Attribute.findAll({
      attributes: [['name', 'label'], ['id', 'value']],
    });
    
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', attributes));
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
    attributeDropdown
};