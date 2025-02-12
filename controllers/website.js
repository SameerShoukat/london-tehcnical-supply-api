const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const Website = require('../models/website');
const User = require('../models/users');

// Create a new website
const create = async (req, res, next) => {
  try {

        // Parse the incoming data
      const payload = typeof req.body.data === 'string'
        ? JSON.parse(req.body.data)
        : req.body.data;
  
      // Attach the file path (if available) and userId to the payload
      payload.logo = req.file ? req.file.path : null;
      payload.userId = req.user.id;



      // Check if the user exists (including soft-deleted ones)
      const existingData = await Website.findOne({
          paranoid: false,
          where: { url: createSlug(payload.url) },
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted with new data
              await existingData.restore();
              // Update the existing with new data
              await existingData.update(payload);
              
              return res.status(201).json(message(true, 'Website created successfully', existingData));
          } else {
              throw boom.conflict('Website already exists with this name');
          }
      }
      
      const website = await Website.create(payload);
      return res.status(201).json(message(true, 'Website created successfully', website));

  } catch (error) {
      next(error);
  }
};

// Get all website with optional filtering
const getAll = async (req, res, next) => {
  try {

    const { offset = 0, pageSize = 10 } = req.query;

    // count
    const count = await Website.count();

    // Get the paginated rows
    const rows = await Website.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset,
    });


    return res.status(200).json(message(true, 'Website retrieved successfully', rows, count))
  } catch (error) {
    next(error);
  }
};


// Get a single website by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const website = await Website.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        });
        if (!website) throw boom.notFound('Website not found');
        return res.status(200).json(message(true, 'Website retrieved successfully', website));
    } catch (error) {
      next(error);
    }
};

// Update a website by ID
const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params;

            // Parse the incoming data
            const payload = typeof req.body.data === 'string'
            ? JSON.parse(req.body.data)
            : req.body.data;

          // Attach the file path (if available) and userId to the payload
          payload.logo = req.file ? req.file.path : null;
          payload.userId = req.user.id;

        
        const website = await Website.findByPk(id);
        if (!website) throw boom.notFound('Website not found');

        // Update the website
        await website.update(payload);

        return res.status(200).json(message(true, 'Website updated successfully', website));

    } catch (error) {
      next(error);
    }
};

// Delete a website by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const website = await Website.findByPk(id);

        if (!website) {
            throw boom.notFound('Website not found');
        }

        await website.destroy(); //soft deleted

        return res.status(200).json(message(true, 'Website deleted successfully'));
    } catch (error) {
      next(error);
    }
};


const websiteDropdown = async (req, res, next) => {
  try {

    const subCategory = await Website.findAll({
      attributes: [['name', 'label'], ['id', 'value']],
    });

    return res.status(200).json(message(true, 'Dropdown retrieved successfully', subCategory));
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
    websiteDropdown
};