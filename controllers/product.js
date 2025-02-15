const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const sequelize = require('../config/database');
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const {Product, PRODUCT_STATUS} = require('../models/products/index');
const Catalog = require('../models/catalog');
const Category = require('../models/category');
const Website = require('../models/website');
const SubCategory = require('../models/subCategory');
const User = require('../models/users');
const ProductAttribute = require("../models/products/product_attribute")
const ProductPricing = require("../models/products/pricing")


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
  const transaction = await sequelize.transaction();
  
  try {
    const payloadData = typeof req.body.data === 'string' 
      ? JSON.parse(req.body.data) 
      : req.body.data;

  

   const payload = {
      ...payloadData,
      catalogId: payloadData.catalogId || null,
      catId: payloadData.catId || null,
      subCategoryId: payloadData.subCategoryId || null,
      websiteId: payloadData.websiteId || null
    };
    payload.userId = req.user.id;

    if (req.files?.length > 0) {
      payload.images = req.files.map(file => file.path);
    }
    
    const slug = createSlug(payload.name);
    const existingProduct = await Product.findOne({
      paranoid: false,
      where: { slug }
    });

    let product;
    if (existingProduct?.deletedAt) {
      await existingProduct.restore({ transaction });

      product = await existingProduct.update(payload, { transaction });
  
    } 
    else if (existingProduct) {
      throw boom.conflict('Product already exists with this name');
    } 
    else {
      // Create product
      product = await Product.create(payload, { transaction });
    }
    const attributes = payload.attributes ||  [], pricing = payload.pricing || [];

    // Create product attributes
    if (attributes?.length > 0) {
      await ProductAttribute.bulkCreate(
        attributes.map(attr => ({
          productId: product.id,
          attributeId: attr.attributeId,
          value: attr.value
        })),
        { transaction }
      );
    }

    // Create product pricing
    if (pricing?.length > 0) {
      await ProductPricing.bulkCreate(
        pricing.map(price => ({
          productId: product.id,
          currency : price.currency,
          discountType : price.discountType,
          discountValue : price.discountValue,
          basePrice : price.basePrice,
        })),
        { transaction }
      );
    }

    // Fetch the complete product with associations
    const completeProduct = await Product.findByPk(product.id, {
      include: [
        { model: ProductAttribute, as: 'productAttributes', include: ['attribute'] },
        { model: ProductPricing, as: 'productPricing' }
      ],
      transaction
    });

    await transaction.commit();
    return res.status(201).json(message(true, 'Product created successfully', completeProduct));
  } catch (error) {
    await transaction.rollback();
    next(error);
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


    // Get products with pagination
    const { count, rows } = await Product.findAndCountAll({
      where,
      pageSize,
      offset,
      order
    });


    return res.status(200).json(message(true, 'Products retrieved successfully', rows, count));
  } catch (error) {
    handleError(error, next);
  }
};

const getOne = async (req, res, next) => {
  try {
    console.log(req.params.id)
    const product = await Product.findByPk(req.params.id,
      {
        include : [
          {
            model: ProductPricing,
            as : 'productPricing',
            attributes: ['currency', 'discountType', 'discountValue', 'basePrice']
          },
          {
            model: ProductAttribute,
            as : 'productAttributes',
            attributes: ['attributeId', 'value']
          }
        ]
      }
    );

    if (!product) {
      throw boom.notFound('Product not found');
    }
    
    return res.status(200).json(message(true, 'Product retrieved successfully', product));
  } catch (error) {
    next(error)
  }
};

const updateOne = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const payload = typeof req.body.data === 'string' 
      ? JSON.parse(req.body.data) 
      : req.body.data;

    // Find existing product
    const existingProduct = await Product.findByPk(id);
    if (!existingProduct) {
      throw boom.notFound('Product not found');
    }

    // If name is being changed, check for slug conflicts
    if (payload.name && payload.name !== existingProduct.name) {
      const slug = createSlug(payload.name);
      const slugExists = await Product.findOne({
        where: { 
          slug,
          id: { [Op.ne]: id } // Exclude current product
        }
      });
      
      if (slugExists) {
        throw boom.conflict('Product already exists with this name');
      }
    }

    // Handle image updates
    if (req.files?.length > 0) {
      payload.images = req.files.map(file => file.path);
    }

    // Update main product
    await existingProduct.update(payload, { transaction });

    // Handle attributes update
    if (payload.attributes) {
      // Delete existing attributes
      await ProductAttribute.destroy({
        where: { productId: id },
        transaction
      });

      // Create new attributes
      if (payload.attributes.length > 0) {
        await ProductAttribute.bulkCreate(
          payload.attributes.map(attr => ({
            productId: id,
            attributeId: attr.attributeId,
            value: attr.value
          })),
          { transaction }
        );
      }
    }

    // Handle pricing update
    if (payload.pricing) {
      // Delete existing pricing
      await ProductPricing.destroy({
        where: { productId: id },
        transaction
      });

      // Create new pricing
      if (payload.pricing.length > 0) {
        await ProductPricing.bulkCreate(
          payload.pricing.map(price => ({
            productId: id,
            currency: price.currency,
            discountType: price.discountType,
            discountValue: price.discountValue,
            basePrice: price.basePrice,
          })),
          { transaction }
        );
      }
    }

    // Fetch updated product with associations
    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: ProductAttribute, as: 'productAttributes', include: ['attribute'] },
        { model: ProductPricing, as: 'productPricing' }
      ],
      transaction
    });

    await transaction.commit();
    return res.json(message(true, 'Product updated successfully', updatedProduct));

  } catch (error) {
    await transaction.rollback();
    next(error);
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

const productDropdown = async (req, res, next) => {
  try {
    const { query } = req.query;

    // Safest ORM approach with field concatenation
    const products = await Product.findAll({
      attributes: [
        ['id', 'value'],
        [sequelize.literal("sku || ' - ' || name"), 'label']
      ],
      where: query ? {
        name: { [Op.iLike]: `%${query}%` } // Case-insensitive search
      } : {},
      order: [['name', 'ASC']] // Good practice for dropdowns
    });

    // Already in correct format { value: id, label: "SKU - Name" }
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', products));
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
  updateStatus,
  productDropdown
};