const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const ProductReview = require('../models/products/reviews');
const Product = require('../models/products');

// Create a new review
const createReview = async (req, res, next) => {
  try {

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const existingReview = await ProductReview.findOne({
      paranoid: false,
      where: { 
        productId: payload.productId,
        email : payload.email
      },
    });

    if (existingReview) {
      if (existingReview.deletedAt) {
        await existingReview.restore();
        await existingReview.update(payload);
        return res.status(201).json(message(true, 'Product review created successfully', existingReview));
      } else {
        throw boom.conflict('You have already reviewed this product');
      }
    }

    const review = await ProductReview.create(payload);
    return res.status(201).json(message(true, 'Product review created successfully', review));
  } catch (error) {
    next(error);
  }
};

// Get all reviews with optional filtering
const getAllReviews = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10, productId, status } = req.query;
    
    const whereClause = {};
    if (productId) whereClause.productId = productId;
    if (status) whereClause.status = status;

    const count = await ProductReview.count({ where: whereClause });

    const rows = await ProductReview.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset: parseInt(offset, 10),
    });
  
    return res.status(200).json(message(true, 'Product reviews retrieved successfully', rows, count));
  } catch (error) {
    next(error);
  }
};

// Get a single review by ID
const getOneReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await ProductReview.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ]
    });
    if (!review) throw boom.notFound('Product review not found');
    return res.status(200).json(message(true, 'Product review retrieved successfully', review));
  } catch (error) {
    next(error);
  }
};

// Update a review by ID
const updateOneReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    const review = await ProductReview.findByPk(id);
    if (!review) throw boom.notFound('Product review not found');

    // Update the review
    await review.update(payload);

    return res.status(200).json(message(true, 'Product review updated successfully', review));
  } catch (error) {
    next(error);
  }
};

// Delete a review by ID
const deleteOneReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await ProductReview.findByPk(id);
    
    if (!review) {
      throw boom.notFound('Product review not found');
    }

    await review.destroy(); 

    return res.status(200).json(message(true, 'Product review deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// Update review status (admin function)
const updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw boom.badRequest('Invalid status value');
    }
    
    const review = await ProductReview.findByPk(id);
    if (!review) throw boom.notFound('Product review not found');

    // Update the status
    await review.update({ status });

    return res.status(200).json(message(true, 'Review status updated successfully', review));
  } catch (error) {
    next(error);
  }
};

// Get product average rating
const getProductRating = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const result = await ProductReview.findAll({
      where: { 
        productId,
        status: 'approved'
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ]
    });
    
    const rating = {
      averageRating: parseFloat(result[0].dataValues.averageRating || 0).toFixed(1),
      totalReviews: parseInt(result[0].dataValues.totalReviews || 0)
    };
    
    return res.status(200).json(message(true, 'Product rating retrieved successfully', rating));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getOneReview,
  updateOneReview,
  deleteOneReview,
  updateReviewStatus,
  getProductRating
};