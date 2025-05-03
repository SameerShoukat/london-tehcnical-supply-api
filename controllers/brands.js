const { createSlug, message } = require("../utils/hook");
const boom = require("@hapi/boom");
const Brand = require('../models/products/brand');

// Create Brand
const create = async (req, res, next) => {
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const existingData = await Brand.findOne({
      paranoid: false,
      where: { slug: createSlug(payload.name) }
    });

    if (existingData) {
      if (existingData.deletedAt) {
        await existingData.restore();
        await existingData.update(payload);
        return res.status(201).json(message(true, 'Brand created successfully', existingData));
      } else {
        throw boom.conflict('Brand already exists with this name');
      }
    }

    const brand = await Brand.create(payload);
    return res.status(201).json(message(true, 'Brand created successfully', brand));

  } catch (error) {
    next(error);
  }
};

// Get all brands
const getAll = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;
    const count = await Brand.count();
    const rows = await Brand.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset
    });

    return res.status(200).json(message(true, 'Brands retrieved successfully', rows, count));
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) throw boom.notFound('Brand not found');
    return res.status(200).json(message(true, 'Brand retrieved successfully', brand));
  } catch (error) {
    next(error);
  }
};

const updateOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const brand = await Brand.findByPk(id);
    if (!brand) throw boom.notFound('Brand not found');

    await brand.update(payload);
    return res.status(200).json(message(true, 'Brand updated successfully', brand));
  } catch (error) {
    next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);
    if (!brand) throw boom.notFound('Brand not found');

    await brand.destroy();
    return res.status(200).json(message(true, 'Brand deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const brandDropdown = async (req, res, next) => {
  try {
    const brands = await Brand.findAll({
      attributes: [['name', 'label'], ['id', 'value']]
    });
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', brands));
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
  brandDropdown
};
