const { createSlug } = require("../utils/hook");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const Category = require('../models/category');
const User = require('../models/users');
const Catalog = require('../models/catalog');
const Subcategory = require("../models/subCategory");

// Create a new category
const create = async (req, res, next) => {
  try {

      const payload =  typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      payload['images'] = req?.files?.length > 0  ? req.files.map(file => file.path) : [];
      payload['userId'] = req.user.id;
      
      const existingData = await Category.findOne({
          paranoid: false,
          where: { slug: createSlug(payload.name), catalogId : payload.catalogId},
      });

      if (existingData) {
          if (existingData.deletedAt) {
              // Restore soft-deleted with new data
              await existingData.restore();
              // Update the existing with new data
              await existingData.update(payload);
              
              return res.status(201).json(message(true, 'Category created successfully', existingData));
          } else {
              throw boom.conflict('Category already exists with this name');
          }
      }
      
      const category = await Category.create(payload);
      return res.status(201).json(message(true, 'Category created successfully', category));

  } catch (error) {
      next(error);
  }
};

// Get all category with optional filtering
const getAll = async (req, res, next) => {
  try {
    
    const { offset = 0, pageSize = 10 } = req.query;
    
    // Get the total count of matching rows
    const count = await Category.count();

    // Get the paginated rows
    const rows = await Category.findAll({
        include: [
          {
            model: Catalog,
            as : 'catalog',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(pageSize, 10),
        offset,
      });
  
      return res.status(200).json(message(true, 'Category retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};


// Get a single category by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: Catalog,
              as : 'catalog',
              attributes: ['id', 'name', 'images']
            }
          ]
        });
        if (!category) throw boom.notFound('Category not found');
        return res.status(200).json(message(true, 'Category retrieved successfully', category));
    } catch (error) {
      next(error);
    }
};

// Update a category by ID
const updateOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        const images = req?.files?.length > 0  ? req.files.map(file => file.path) : [];
        const payload =  typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        payload['userId'] = req.user.id;

        if(images.length > 0) payload.images = images;
        
        const category = await Category.findByPk(id);
        if (!category) throw boom.notFound('Category not found');

        // Update the category
        await category.update(payload);

        return res.status(200).json(message(true, 'Category updated successfully', category));

    } catch (error) {
      next(error);
    }
};

// Delete a category by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            throw boom.notFound('Category not found');
        }

        await category.destroy(); //soft deleted

        return res.status(200).json(message(true, 'Category deleted successfully'));
    } catch (error) {
      next(error);
    }
};

const categoryDropdown = async (req, res, next) => {
  try {
    const { catalogId } = req.query;


    const whereClause = {};

    if (catalogId) whereClause.catalogId = catalogId;

    
    const category = await Category.findAll({
      attributes: [['name', 'label'], ['id', 'value']],
      where: whereClause
    });
    
    return res.status(200).json(message(true, 'Dropdown retrieved successfully', category));
  } catch (error) {
    next(error);
  }
}

const categoryList = async (req, res, next) => {
  try {

    const { offset = 0, pageSize = 10 } = req.query;

    // Get the paginated rows
    const rows = await Category.findAll({
      attributes: [['name', 'label'], ['id', 'value'], ['productCount', 'count'], ['slug', 'slug']],
      order: [['name', 'DESC']],
      include:[{model : Subcategory, attributes: [['name', 'label'], ['id', 'value'],  ['slug', 'slug']], as : 'sub_categories'}],
      limit: parseInt(pageSize, 10),
      offset,
    });


    return res.status(200).json(message(true, 'Category retrieved successfully', rows));
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
    categoryDropdown,
    categoryList
};