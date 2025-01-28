// controllers/orderController.js
const Order = require('../models/orders');
const Product = require('../models/products');
const Boom = require('@hapi/boom');

const createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      userId: req.user.id,
      total: req.body.total
    });

    // Add order items
    await Promise.all(req.body.products.map(async (item) => {
      const product = await Product.findByPk(item.productId);
      
      if (!product || product.stock < item.quantity) {
        throw Boom.badRequest('Insufficient product stock');
      }

      // Decrease product stock
      await product.decrement('stock', { by: item.quantity });
    }));

    res.status(201).json(order);
  } catch (error) {
    throw Boom.internal('Error creating order');
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id }
    });
    res.json(orders);
  } catch (error) {
    throw Boom.internal('Error fetching orders');
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!order) {
      throw Boom.notFound('Order not found');
    }

    res.json(order);
  } catch (error) {
    throw Boom.internal('Error fetching order');
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const [updated] = await Order.update(
      { status: req.body.status },
      { 
        where: { 
          id: req.params.id,
          userId: req.user.id 
        } 
      }
    );

    if (!updated) {
      throw Boom.notFound('Order not found');
    }

    const updatedOrder = await Order.findByPk(req.params.id);
    res.json(updatedOrder);
  } catch (error) {
    throw Boom.internal('Error updating order status');
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
