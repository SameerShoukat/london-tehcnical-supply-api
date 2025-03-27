const { createSlug } = require("../utils/hook");
const { Op } = require('sequelize');
const _ = require("lodash");
const sequelize = require('../config/database');
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const {Product, PRODUCT_STATUS, TAGS} = require('../models/products/index');
const Catalog = require('../models/catalog');
const Category = require('../models/category');
const Website = require('../models/website');
const SubCategory = require('../models/subCategory');
const User = require('../models/users');
const ProductAttribute = require("../models/products/product_attribute")
const ProductPricing = require("../models/products/pricing")
const Attribute = require("../models/products/attributes")


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
          discountType : price.discountType || '',
          discountValue : price.discountValue || 0,
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
      catalogId,
      categoryId,
      subCategoryId,
      websiteId,
      offset = 0, 
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause dynamically
    const where = _.pickBy({
      catalogId,
      categoryId,
      subCategoryId,
      websiteId
    }, _.identity);

    // Validate sort parameters
    const validSortColumns = ['createdAt', 'name'];
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
    next(error);
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
            discountType: price?.discountType || '',
            discountValue: price?.discountValue || 0,
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
    next(error);
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
    next(error);
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


const assignTag = async (req, res, next) => {
  try {

    const product = await findProduct(req.params.id);
    const tag = req?.query?.tag;

    if (!tag || !Object.values(TAGS).includes(req.query.tag)) {
      throw boom.badRequest(`Invalid status. Must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}`);
    }
    
    if (!product.tags.includes(tag)) {
      product.tags.push(tag);
    }

    await product.save();
    return res.status(200).json(message(true, 'Product tags added successfully'));
  } catch (error) {
    next(error);
  }
};

const removeTag = async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id);
    const tag = req?.query?.tag;
    
    if (!tag || !Object.values(TAGS).includes(req.query.tag)) {
      throw boom.badRequest(`Invalid status. Must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}`);
    }

    if (product.tags.includes(tag)) {
      product.tags = product.tags.filter(tag => tag !== tag);
    }
    await product.save();
    return res.status(200).json(message(true, 'Product tags removed successfully'));
  } catch (error) {
    next(error);
  }
};


const attributeList = async (req, res, next) =>{
  try{
    const {attributeName} =  req.query
    if(!attributeName) throw boom.badRequest("Attribute is require to access this endpoint")

    // Find the attribute (case-insensitive)
    const attribute = await Attribute.findOne({
      where: {
        name: {
          [Op.iLike]: attributeName,
        },
      },
    });

    if (!attribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }


    const results = await ProductAttribute.findAll({
      attributes: [
      'value',
      [sequelize.fn('COUNT', sequelize.col('productId')), 'productCount'],
      'attributeId' // Include attributeId
      ],
      where: {
      attributeId: attribute.id, // Filter by the attribute ID
      },
      group: ['value', 'attributeId'], // Group by both value and attributeId
      order: [['value', 'ASC']],
    });



    res.status(200).json(message(true, 'Attribute retrieved successfully', results))
  }
  catch(error){
    next(error)
  }
}


const productList = async (req, res, next) => {
  try {
    const {
      catalogId,
      categoryId,
      subCategoryId,
      websiteId,
      attributes, // Can be a JSON string or an object, e.g., { brand: 'Mercedes' }
      page = 1,
      offset = 0,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    // Get user IP and determine country
    const userIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const country = 'UK'; // Implement this function
    
    // Define price currency mapping based on country
    const currencyMap = {
      UK: 'GBP',
      US: 'USD',
      UAE: 'AED'
    };
    const currency = currencyMap[country] || 'USD'; // Default to USD

    // Build base where clause for the Product model
    const baseWhere = _.pickBy({ catalogId, categoryId, subCategoryId }, _.identity);
    
    // Handle websiteId as an array
    const where = { ...baseWhere };
    if (websiteId) {
      let websiteIds = [];
      if (typeof websiteId === 'string' && websiteId.includes(',')) {
        websiteIds = websiteId.split(',').map(id => id.trim());
      } else if (Array.isArray(websiteId)) {
        websiteIds = websiteId;
      } else {
        websiteIds = [websiteId];
      }
      // Use the overlap operator to match any websiteId in the array
      where.websiteId = { [Op.overlap]: websiteIds };
    }

    // Validate and normalize sort parameters
    const validSortColumns = ['createdAt', 'name'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = validSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : 'DESC';
    const order = [[sortColumn, sortDir]];

    // Process attribute filtering:
    // If 'attributes' is already an object, use it directly.
    let attributeFilter = {};
    if (attributes) {
      if (typeof attributes === 'object') {
        attributeFilter = attributes;
      } else {
        try {
          attributeFilter = JSON.parse(attributes);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid attributes format' });
        }
      }
    }

    let productIds = [];
    if (Object.keys(attributeFilter).length > 0) {
      // attributeFilter is in the form { brand: 'Mercedes', ... }
      const attributeNames = Object.keys(attributeFilter);

      // Retrieve the corresponding Attribute records (assuming Attribute model stores the attribute names)
      const attributeRecords = await Attribute.findAll({
        where: { name: attributeNames },
      });

      // If some attribute names are not found, then no product can match the filter.
      if (attributeRecords.length !== attributeNames.length) {
        return res.status(200).json(message(true, 'Products retrieved successfully', [], 0));
      }

      // Build conditions for filtering in ProductAttribute.
      // For each attribute record, filter on its ID and the expected value.
      const conditions = attributeRecords.map(attr => ({
        attributeId: attr.id,
        value: attributeFilter[attr.name],
      }));

      // Query ProductAttribute to find products matching any of the conditions,
      // and then group by productId and use HAVING to ensure all conditions are met.
      const productAttributes = await ProductAttribute.findAll({
        attributes: ['productId'],
        where: {
          [Op.or]: conditions,
        },
        group: ['productId'],
        having: sequelize.literal(`COUNT(DISTINCT "attributeId") = ${conditions.length}`),
      });
      
      productIds = productAttributes.map(pa => pa.productId);

      // If no matching products, return an empty result early.
      if (productIds.length === 0) {
        return res.status(200).json(message(true, 'Products retrieved successfully', [], 0));
      }

      // Add the found product IDs to the main query.
      where.id = { [Op.in]: productIds };
    }

    // Retrieve products with pagination, sorting, and include pricing for the user's currency
    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(pageSize, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(pageSize, 10) + parseInt(offset, 10),
      order,
      include: [
        {
          model: ProductPricing,
          as: 'productPricing',
          attributes: ['currency', 'discountType', 'discountValue', 'basePrice'],
          where: { currency },
          required: false // Allow products without pricing in the user's currency
        }
      ]
    });

    // Format products with the correct price for the user's country
    const formattedProducts = rows.map(product => {
      // Convert to plain object
      const plainProduct = product.toJSON();
      
      // Extract the first (and only) pricing if it exists
      const pricing = plainProduct.productPricing && plainProduct.productPricing.length > 0 
        ? plainProduct.productPricing[0] 
        : null;
      
      // Return formatted product with pricing as an object, not an array
      return {
        ...plainProduct,
        productPricing: pricing || null
      };
    });

    return res.status(200).json(message(true, 'Products retrieved successfully', formattedProducts, formattedProducts.length));
  } catch (error) {
    next(error);
  }
};


const getProductDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Get user IP and determine country (similar to productList)
    const userIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const country = 'UK'; // Implement actual country detection
    
    // Define price currency mapping based on country
    const currencyMap = {
      UK: 'GBP',
      US: 'USD',
      UAE: 'AED'
    };
    const currency = currencyMap[country] || 'USD';

    const productData = await Product.findOne({where:{slug}})

    // Fetch product with pricing and attributes
    const product = await Product.findByPk(productData.id, {
      attributes: [
        'id', 
        'sku', 
        'name', 
        'slug', 
        'images', 
        'status', 
        'tags', 
        'inStock', 
        'description'
      ],
      include: [
        {
          model: ProductPricing,
          as: 'productPricing',
          attributes: ['currency', 'discountType', 'discountValue', 'basePrice', 'finalPrice'],
          where: { currency },
          required: true
        },
        {
          model: ProductAttribute,
          as: 'productAttributes',
          attributes: ['value'],
          include: [{
            model: Attribute,
            as: 'attribute',
            attributes: ['name']
          }]
        },
        {
          model: Category,
          as: 'category',
          attributes: ['name', 'slug']
        },
        {
          model: SubCategory,
          as: 'subCategory',
          attributes: ['name', 'slug']
        }
      ]
    });

    if (!product) {
      throw boom.notFound('Product not found');
    }

    return res.json(message(true, 'Product details retrieved successfully', product));
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
  productDropdown,
  attributeList,
  productList,
  assignTag,
  removeTag,
  getProductDetail
};