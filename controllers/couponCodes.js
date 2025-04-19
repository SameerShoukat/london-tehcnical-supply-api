// controllers/couponCode.js
const { message } = require('../utils/hook');
const boom = require('@hapi/boom');
const CouponCode = require('../models/couponCodes');
const Website = require('../models/website');

// Create a new coupon code
const create = async (req, res, next) => {
  try {
    const payload = req.body;

    const existing = await CouponCode.findOne({
      where: { code: payload.code, websiteId: payload.websiteId, currency: payload.currency }});

    if (existing) {
      throw boom.conflict('Coupon code already exists for this website and currency');
    }

    const websiteData = await Website.findByPk(payload.websiteId)
    payload.url = websiteData.url

    const coupon = await CouponCode.create(payload);
    return res.status(201).json(message(true, 'CouponCode created successfully', coupon));
  } catch (error) {
    next(error);
  }
};

// Get all coupon codes, optional filter by website
const getAll = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10, websiteId } = req.query;
    const where = {};
    if (websiteId) where.websiteId = websiteId;

    const count = await CouponCode.count({ where });
    const rows = await CouponCode.findAll({
      where,
      include: [{ model: Website, as: 'website', attributes: ['id','name','url'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset: parseInt(offset, 10),
    });

    return res.status(200).json(message(true, 'CouponCodes retrieved', rows, count));
  } catch (error) {
    next(error);
  }
};

// Get one coupon code by ID
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await CouponCode.findByPk(id, {
      include: [{ model: Website, as: 'website', attributes: ['id','name','url'] }]
    });
    if (!coupon) throw boom.notFound('CouponCode not found');
    return res.status(200).json(message(true, 'CouponCode retrieved', coupon));
  } catch (error) {
    next(error);
  }
};

// Update a coupon code by ID
const updateOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const coupon = await CouponCode.findByPk(id);
    if (!coupon) throw boom.notFound('CouponCode not found');

    const websiteData = await Website.findByPk(payload.websiteId)
    payload.url = websiteData.url
    
    await coupon.update(payload);
    return res.status(200).json(message(true, 'CouponCode updated', coupon));
  } catch (error) {
    next(error);
  }
};

// Delete a coupon code by ID
const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await CouponCode.findByPk(id);
    if (!coupon) throw boom.notFound('CouponCode not found');

    await coupon.destroy();
    return res.status(200).json(message(true, 'CouponCode deleted'));
  } catch (error) {
    next(error);
  }
};

// Validate a coupon code
const validateCode = async (req, res, next) => {
  try {
    const { code, websiteId, currency } = req.body;
    const coupon = await CouponCode.findOne({
      where: { code, websiteId, currency }
    });
    if (!coupon) throw boom.notFound('Invalid coupon code');

    return res.status(200).json(message(true, 'CouponCode valid', { amount: coupon.amount, currency: coupon.currency }));
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
  validateCode,
};