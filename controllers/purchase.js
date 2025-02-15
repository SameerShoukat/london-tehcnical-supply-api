const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const {Purchase} = require('../models/products/purchase');
const {Product} = require('../models/products');
const Vendor = require('../models/vendor');
const User = require('../models/users');



// Create a new record
const create = async (req, res, next) => {
  try {

      const payload =  typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      payload.userId = req.user.id;

      const vendor = await Purchase.create(payload);
      return res.status(201).json(message(true, 'Purchase added successfully', vendor));

  } catch (error) {
      next(error);
  }
};

// Get all record with optional filtering
const getAll = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;

    // count
    const count = await Purchase.count();

    // Get the paginated rows
    const rows = await Purchase.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku'],
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'email'],
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset,
    });

    return res.status(200).json(message(true, 'Purchase retrieved successfully', rows, count));

  } catch (error) {
    next(error);
  }
};


// Get a single record by ID
const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id,{
          include: [
            {
              model: User,
              as : 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: Product,
                as : 'product',
            },
            {
                model: Vendor,
                as : 'vendor',
                attributes: ['firstName', 'lastName', 'email', 'phone', 'companyName']
            },
          ]
        });
        if (!purchase) throw boom.notFound('Purchase not found');
        return res.status(200).json(message(true, 'Purchase retrieved successfully', purchase));
    } catch (error) {
      next(error);
    }
};

// Update a record by ID
const updateOne = async (req, res, next) => {
    try {
        
        const { id } = req.params;

        const payload =  typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        payload.userId = req.user.id;
        
        const purchase = await Purchase.findByPk(id);
        if (!purchase) throw boom.notFound('Purchase not found');

        // Update the purchase
        await purchase.update(payload);

        return res.status(200).json(message(true, 'Purchase updated successfully', purchase));

    } catch (error) {
      next(error);
    }
};

// Delete a record by ID
const deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id);

        if (!purchase) {
            throw boom.notFound('Purchase not found');
        }

        await purchase.destroy(); //soft deleted

        return res.status(200).json(message(true, 'Purchase deleted successfully'));
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
};