const { createSlug, message } = require("../utils/hook");
const boom = require("@hapi/boom");
const VehicleType = require('../models/products/vehicleType');


// Create Vehicle Type
const create = async (req, res, next) => {
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const existingData = await VehicleType.findOne({
      paranoid: false,
      where: { slug: createSlug(payload.name) }
    });

    if (existingData) {
      if (existingData.deletedAt) {
        await existingData.restore();
        await existingData.update(payload);
        return res.status(201).json(message(true, 'Vehicle Type created successfully', existingData));
      } 
      else {
        throw boom.conflict('Vehicle Type already exists with this name');
      }
    }

    const vehicleType = await VehicleType.create(payload);
    return res.status(201).json(message(true, 'Vehicle Type created successfully', vehicleType));
  } catch (error) {
    next(error);
  }
};

// Get all vehicle types
const getAll = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;
    const count = await VehicleType.count();
    const rows = await VehicleType.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset
    });

    return res.status(200).json(message(true, 'Vehicle Types retrieved successfully', rows, count));
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const vehicleType = await VehicleType.findByPk(req.params.id);
    if (!vehicleType) throw boom.notFound('Vehicle Type not found');
    return res.status(200).json(message(true, 'Vehicle Type retrieved successfully', vehicleType));
  } catch (error) {
    next(error);
  }
};

const updateOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const vehicleType = await VehicleType.findByPk(id);
    if (!vehicleType) throw boom.notFound('Vehicle Type not found');

    await vehicleType.update(payload);
    return res.status(200).json(message(true, 'Vehicle Type updated successfully', vehicleType));
  } catch (error) {
    next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicleType = await VehicleType.findByPk(id);
    if (!vehicleType) throw boom.notFound('Vehicle Type not found');

    await vehicleType.destroy();
    return res.status(200).json(message(true, 'Vehicle Type deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const vehicleTypeDropdown = async (req, res, next) => {
  try {
    const types = await VehicleType.findAll({
      attributes: [['name', 'label'], ['id', 'value']]
    });
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', types));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  updateOne,
  deleteOne,
  vehicleTypeDropdown
};
