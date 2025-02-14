const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const Vendor = require('../models/vendor');
const User = require('../models/users');



// Create a new vendor
const create = async (req, res, next) => {
  try {

      const payload =  typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      payload.userId = req.user.id;

      // Check if the user exists (including soft-deleted ones)
      const existingData = await Vendor.findOne({
          paranoid: false,
          where: { email: createSlug(payload.email)},
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted with new data
              await existingData.restore();
              // Update the existing with new data
              await existingData.update(payload);
              
              return res.status(201).json(message(true, 'Vendor created successfully', existingData));
          } else {
              throw boom.conflict('Vendor already exists with this email');
          }
      }
      
      const vendor = await Vendor.create(payload);
      return res.status(201).json(message(true, 'Vendor created successfully', vendor));

  } catch (error) {
      next(error);
  }
};

// Get all vendor with optional filtering
const getAll = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;

    // count
    const count = await Vendor.count();

    // Get the paginated rows
    const rows = await Vendor.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset,
    });

    
    
    return res.status(200).json(message(true, 'Vendor retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};


// Get a single vendor by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        });
        if (!vendor) throw boom.notFound('Vendor not found');
        return res.status(200).json(message(true, 'Vendor retrieved successfully', vendor));
    } catch (error) {
      next(error);
    }
};

// Update a vendor by ID
const updateOne = async (req, res, next) => {
    try {
        
        const { id } = req.params;

        const payload =  typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        payload.userId = req.user.id;
        
        const vendor = await Vendor.findByPk(id);
        if (!vendor) throw boom.notFound('Vendor not found');

        // Update the vendor
        await vendor.update(payload);

        return res.status(200).json(message(true, 'Vendor updated successfully', vendor));

    } catch (error) {
      next(error);
    }
};

// Delete a vendor by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            throw boom.notFound('Vendor not found');
        }

        await vendor.destroy(); //soft deleted

        return res.status(200).json(message(true, 'Vendor deleted successfully'));
    } catch (error) {
      next(error);
    }
};

const vendorDropdown = async (req, res, next) => {
  try {
    const vendors = await Vendor.findAll({
      attributes: [['name', 'label'], ['id', 'value']]
    });
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', vendors));
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
    vendorDropdown
};