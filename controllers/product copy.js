const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const {Product, PRODUCT_STATUS} = require('../models/products/index');
const Catalog = require('../models/catalog');
const Category = require('../models/category');
const Website = require('../models/website');
const SubCategory = require('../models/subCategory');
const User = require('../models/users');


// Common error handler
const handleError = (error, next) => {
  if (error.name === 'SequelizeValidationError') {
    next(boom.badRequest(error.message));
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    next(boom.conflict('Resource already exists'));
  } else {
    next(boom.internal('Internal server error', error));
  }
};

// Common product finder
const findProduct = async (id) => {
  const product = await Product.findByPk(id,{
    include: [
        {
          model: Catalog,
          as : 'catalog',
          attributes: ['id', 'name']
        }
      ],
});
  if (!product) {
    throw boom.notFound('Product not found');
  }
  return product;
};

const create = async (req, res, next) => {
  try {
    const payload = typeof req.body.data === 'string' 
      ? JSON.parse(req.body.data) 
      : req.body.data;

    // Handle image uploads
    if (req.files?.length > 0) {
      payload.images = req.files.map(file => file.path);
    }

    // Add user ID from authenticated session
    payload.userId = req.user.id;

    // Check for existing product (including soft-deleted)
    const slug = createSlug(payload.name);
    const existingProduct = await Product.findOne({
      paranoid: false,
      where: { slug }
    });

    let product;
    if (existingProduct?.deletedAt) {
      // Restore and update soft-deleted product
      await existingProduct.restore();
      product = await existingProduct.update(payload);
    } else if (existingProduct) {
      throw boom.conflict('Product already exists with this name');
    } else {
      // Create new product
      product = await Product.create(payload);
    }

    return res.status(201).json(message(true, 'Product created successfully', product));
  } catch (error) {
    handleError(error, next);
  }
};

const getAll = async (req, res, next) => {
  try {
    const {
      brand,
      catalogId,
      categoryId,
      subCategoryId,
      websiteId,
      page = 1,
      offset = 0, 
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause dynamically
    const where = _.pickBy({
      brand,
      catalogId,
      categoryId,
      subCategoryId,
      websiteId
    }, _.identity);

    // Validate sort parameters
    const validSortColumns = ['createdAt', 'name', 'price', 'brand'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const order = [
      [
        validSortColumns.includes(sortBy) ? sortBy : 'createdAt',
        validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC'
      ]
    ];


    console.log("Product retrieved successful")

    // Get products with pagination
    const { count, rows } = await Product.findAndCountAll({
      where,
      pageSize,
      offset,
      order,
      include: [
        { 
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: SubCategory,
          as: 'subCategory',
          attributes: ['id', 'name']
        },
        { 
            model: Catalog,
            as: 'catalog',
            attributes: ['id', 'name']
          },
          {
            model: Website,
            as: 'website',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email']
          }
      ]
    });

    const totalPages = Math.ceil(count / pageSize);
    const currentPage = page;

    return res.status(200).json(message(true, 'Products retrieved successfully', {
      products: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage,
        pageSize
      }
    }));
  } catch (error) {
    handleError(error, next);
  }
};

const getOne = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { 
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Catalog,
          as: 'catalog',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!product) {
      throw boom.notFound('Product not found');
    }

    return res.status(200).json(message(true, 'Product retrieved successfully', product));
  } catch (error) {
    handleError(error, next);
  }
};

const updateOne = async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id);
    
    // Handle image updates if files are present
    if (req.files?.length > 0) {
      req.body.images = req.files.map(file => file.path);
    }

    const updatedProduct = await product.update(req.body);
    return res.status(200).json(message(true, 'Product updated successfully', updatedProduct));
  } catch (error) {
    handleError(error, next);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id);
    await product.destroy();
    return res.status(200).json(message(true, 'Product deleted successfully'));
  } catch (error) {
    handleError(error, next);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    // Input validation
    if (!req.params.id) {
      throw boom.badRequest('Product ID is required');
    }
    
    if (!req.body.status) {
      throw boom.badRequest('Status is required');
    }

    const { status } = req.body;
    const productId = req.params.id;

    // Find product first
    const product = await findProduct(productId);

    // Validate status value against enum
    if (!Object.values(PRODUCT_STATUS).includes(status)) {
      throw boom.badRequest(`Invalid status. Must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}`);
    }

    // Update product status
    const updatedProduct = await product.update({ status });

    // Send response
    return res.status(200).json(message(true, `Product status updated to ${status} successfully`, updatedProduct));
  } catch (error) {
    // Pass error to error handler middleware
    handleError(error, next);
  }
};

module.exports = {
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  updateStatus
};