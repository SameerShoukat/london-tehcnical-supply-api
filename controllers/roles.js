const Role = require('../models/roles');
const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const allPermissions = require('../models/perrmisions');

// Create a new role
const create = async (req, res, next) => {
  try {
      const roleData = req.body;
      // Check if the user exists (including soft-deleted ones)
      const existingData = await Role.findOne({
          paranoid: false,
          where: { slug: createSlug(roleData.name) },
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted role with new data
              await existingData.restore();
              // Update the existing role with new data
              await existingData.update(roleData);
              
              return res.status(201).json(message(true, 'Role created successfully', existingData));
          } else {
              throw boom.conflict('Role already exists with this name');
          }
      }

      if (roleData?.name?.toLowerCase() === 'admin') {
          roleData.permissions = allPermissions;
      }
      
      const role = await Role.create(roleData);
      return res.status(201).json(message(true, 'Role created successfully', role));

  } catch (error) {
      next(error);
  }
};

// Get all roles with optional filtering
const getAll = async (req, res, next) => {
  try {

    const { pagination = 1, limit = 10 } = req.query;
    const offset = (parseInt(pagination, 10) - 1) * parseInt(limit, 10);

    // Get the total count of matching rows
    const count = await Role.count();

    // Get the paginated rows
    const rows = await Role.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });


      return res.status(200).json(message(true, 'Roles retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};


// Get a single role by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);
        if (!role) throw boom.notFound('Role not found');
        return res.status(200).json(message(true, 'Role retrieved successfully', role));
    } catch (error) {
      next(error);
    }
};

// Update a role by ID
const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(id)

        const updateData = req.body;
        
        const role = await Role.findByPk(id);
        if (!role) throw boom.notFound('Role not found');

        if(role?.slug === 'admin') throw boom.badRequest('You cannot update the admin role');

        // Update the role
        await role.update(updateData);

        return res.status(200).json(message(true, 'Role updated successfully', role));

    } catch (error) {
      next(error);
    }
};

// Delete a role by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);

        if (!role) {
            throw boom.notFound('Role not found');
        }

        if(role.name === 'admin') throw boom.badRequest('You cannot delete the admin role');

        await role.destroy();

        return res.status(200).json(message(true, 'Role deleted successfully'));
    } catch (error) {
      next(error);
    }
};


const getPermission = async (req, res, next) =>{
  res.status(200).json(message(true, 'Permissions retrieved successfully', allPermissions));
}

const getDropdown = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      attributes: [['name', 'label'], ['id', 'value']],
      order: [['name', 'ASC']]
    });

    return res.status(200).json(message(true, 'Dropdown data retrieved successfully', roles));
  } catch (error) {
    next(error);
  }
};

module.exports = {
    create,
    getAll,
    updateOne,
    getOne,
    deleteOne,
    getPermission,
    getDropdown
};