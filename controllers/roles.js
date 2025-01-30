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
        const ifRoleNameExist = await Role.findOne({ where: { slug: createSlug(roleData.name) }});
        if (ifRoleNameExist) {
            throw boom.conflict('Role already exists with this name');
        }

        if(roleData?.name?.toLowerCase() === 'admin'){
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

    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const whereClause = { deletedAt: null };

    // Get the total count of matching rows
    const count = await Role.count({ where: whereClause });

    // Get the paginated rows
    const rows = await Role.findAll({
      where: whereClause,
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
        const role = await Role.findOne({id:id, deletedAt: null});

        if (!role) throw boom.notFound(message(false, 'Role not found'));

        return res.status(200).json(message(true, 'Role retrieved successfully', role));
    } catch (error) {
      next(error);
    }
};

// Update a role by ID
const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const role = await Role.findOne({id:id, deletedAt: null});
        if (!role) throw boom.notFound(message(false, 'Role not found'));
        

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
            throw boom.notFound(message.notFound('Role'));
        }

        if(role.name === 'admin') throw boom.badRequest('You cannot delete the admin role');

        await role.update({ deletedAt: new Date() });

        return res.status(200).json(message(true, 'Role deleted successfully'));
    } catch (error) {
      next(error);
    }
};


const getPermission = async (req, res, next) =>{
  res.status(200).json(message(true, 'Permissions retrieved successfully', allPermissions));
}

module.exports = {
    create,
    getAll,
    updateOne,
    getOne,
    deleteOne,
    getPermission
};