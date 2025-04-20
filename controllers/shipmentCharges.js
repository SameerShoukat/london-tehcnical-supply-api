// controllers/shipmentCharge.js
const { CURRENCY } = require('../constant/types');
const { message } = require('../utils/hook');
const boom = require('@hapi/boom');
const ShipmentCharge = require('../models/shipmentCharges');
const Website = require('../models/website');

// Create a new shipment charge
const create = async (req, res, next) => {
  try {
    const payload = req.body;

    const existing = await ShipmentCharge.findOne({
      where: {
        websiteId: payload.websiteId,
        currency: payload.currency
      },
    });
    if (existing) {
      throw boom.conflict('Shipment charge already exists for this currency');
    }
    const websiteData = await Website.findByPk(payload.websiteId)
    payload.url = websiteData.url


    const charge = await ShipmentCharge.create(payload);
    return res.status(201).json(message(true, 'ShipmentCharge created successfully', charge));
  } catch (error) {
    next(error);
  }
};

// Get all shipment charges, optionally by website
const getAll = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10, websiteId } = req.query;
    const where = {};
    if (websiteId) where.websiteId = websiteId;

    const count = await ShipmentCharge.count({ where });
    const rows = await ShipmentCharge.findAll({
      where,
      include: [{ model: Website, as: 'website', attributes: ['id','name','url'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize, 10),
      offset: parseInt(offset, 10),
    });

    return res.status(200).json(message(true, 'ShipmentCharges retrieved', rows, count));
  } catch (error) {
    next(error);
  }
};

// Get one shipment charge by ID
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const charge = await ShipmentCharge.findByPk(id, {
      include: [{ model: Website, as: 'website', attributes: ['id','name','url'] }]
    });
    if (!charge) throw boom.notFound('ShipmentCharge not found');
    return res.status(200).json(message(true, 'ShipmentCharge retrieved', charge));
  } catch (error) {
    next(error);
  }
};

// Update shipment charge by ID
const updateOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const charge = await ShipmentCharge.findByPk(id);
    if (!charge) throw boom.notFound('ShipmentCharge not found');

    const websiteData = await Website.findByPk(payload.websiteId)
    payload.url = websiteData.url

    await charge.update(payload);
    return res.status(200).json(message(true, 'ShipmentCharge updated', charge));
  } catch (error) {
    next(error);
  }
};

// Delete shipment charge by ID
const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const charge = await ShipmentCharge.findByPk(id);
    if (!charge) throw boom.notFound('ShipmentCharge not found');

    await charge.destroy();
    return res.status(200).json(message(true, 'ShipmentCharge deleted'));
  } catch (error) {
    next(error);
  }
};
// Calculate shipment charge based on country and amount
const calculateShipmentCharge = async (req, res, next) => {
  try {
    const { country, state, zipCode,  totalAmount } = req.body;
    if (!country || !totalAmount) {
      throw boom.badRequest('Country and total amount are required');
    }
    // Get user IP and determine country (placeholder implementation)
    const userIP =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const selectedCountry = "UK"; // TODO: Implement actual country detection

    // Define price currency mapping based on country
    const currencyMap = {
      UK: "GBP",
      US: "USD",
      UAE: "AED",
    };
    const currency = currencyMap[selectedCountry] || "GBP";

    // Find applicable shipment charge
    const charge = await ShipmentCharge.findOne({
      where: { currency }
    });

    if (!charge) {
      throw boom.notFound('No shipment charge found for this region');
    }

    // Calculate final shipping amount
    const totalAmountToCalculate = Number(totalAmount);
    let shippingAmount;
    if (charge.isFixed) {
      shippingAmount = charge.amount;
    } else {
      shippingAmount = (totalAmountToCalculate * charge.amount) / 100;
    }

    return res.status(200).json(message(true, 'Shipment charge calculated', {
      shippingAmount,
      currency,
      amount : charge.amount,
      calculationType: charge.isFixed ? 'fixed' : 'percentage'
    }));
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
  calculateShipmentCharge
};


