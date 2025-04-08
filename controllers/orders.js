// services/orderService.js
const {
  Order,
  OrderItem,
  Payment,
  Address,
  Account,
  OrderHistory,
} = require("../models/order-and-sale/index");
const sequelize = require("../config/database");
const _ = require("lodash");
const boom = require("@hapi/boom");
const { ORDER_STATUS } = require("../constant/types");
const {Product} = require('../models/products/index');
const {
  calculateFinalPrice,
  generatePassword,
  message,
} = require("../utils/hook");
const ProductPricing = require("../models/products/pricing")

const generateOrderNumber = async () => {
  const count = await Order.count();
  return `LTC-O-${count}`;
};

const create = async (req, res, next) => {
  const currency = "GBP";
  const shipping = 10.99;
  const taxAmount = 0.25;
  let discount = 0;

  let shippingAddressSnapshot = "";
  let billingAddressSnapshot = "";

  const { items, email, shippingAddress, billingAddress, paymentMethod, website } =
    req.body;

  // Validate required fields
  if (!items || !items.length) {
    throw boom.badRequest("At least one order item is required");
  }

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Account handling
    let accountId = req?.account?.id ?? null;
    let password;
    if (!accountId) {
      const existingAccount = await Account.findOne({
        where: { email },
        transaction,
      });
      if (existingAccount) {
        accountId = existingAccount.id;
      } else {
        password = generatePassword(10);
        const newAccount = await Account.create(
          { email, password },
          { transaction }
        );
        accountId = newAccount.id;
      }
    }

    const getAddressSnapshot = async (addr, type) => {
      if (addr?.addressId) {
        const address = await Address.findByPk(addr.addressId, {
          attributes: [
            "firstName",
            "lastName",
            "phoneNumber",
            "street",
            "country",
            "city",
            "state",
            "postalCode",
          ],
          where: { accountId },
          transaction,
        });
        if (!address) throw boom.badRequest(`Invalid ${type} address ID`);
        return address.toJSON();
      } else {
        if (!addr?.addressSnapshot) {
          throw boom.badRequest(`${type} address snapshot is required`);
        }
        return addr.addressSnapshot;
      }
    };

    shippingAddressSnapshot = await getAddressSnapshot(
      shippingAddress,
      "shipping"
    );
    billingAddressSnapshot = await getAddressSnapshot(
      billingAddress,
      "billing"
    );

    // Validate products and calculate totals
    const productIds = items.map((item) => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ["id", "name", "sku"],
      include: [
        {
          model: ProductPricing,
          as: "productPricing",
          attributes: [
            "currency",
            "discountType",
            "discountValue",
            "basePrice",
            "finalPrice",
          ],
          where: { currency },
          required: true,
        },
      ],
      transaction,
    });

    products.forEach((product) => {
      const pricing = product.productPricing[0];
      const { productPrice, productDiscount } = calculateFinalPrice(pricing.dataValues);
      discount += productDiscount;
      product.price = +productPrice;
      product.discount = +productDiscount;
      delete product.productPricing;
    });

    if (products.length !== items.length) {
      throw boom.badRequest("One or more products are invalid");
    }

    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    const enrichedItems = items.map((item) => {
      const product = productMap[item.productId];
      return {
        ...item,
        price: product.price,
        discount: product.discount,
        name: product.name,
        sku: product.sku,
      };
    });

    const subtotal = enrichedItems.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);

    const tax = +subtotal * taxAmount;
    const total = +subtotal + tax + shipping - discount;
    const orderNumber = await generateOrderNumber();

    const order = await Order.create(
      {
        website,
        accountId,
        orderNumber,
        shippingAddressSnapshot,
        billingAddressSnapshot,
        subtotal,
        items: enrichedItems,
        tax : Number(tax),
        shippingCost : Number(shipping),
        discount : Number(discount),
        currency,
        total : Number(total),
      },
      { transaction }
    );

    // Create payment record
    await Payment.create(
      {
        orderId: order.id,
        amount: total,
        currency,
        method: paymentMethod,
        status: paymentMethod === "cod" ? "pending" : "unpaid",
      },
      { transaction }
    );

    // Create order history
    await OrderHistory.create(
      {
        orderId: order.id,
        status: "created",
        performedBy: accountId,
        note: "Order created",
      },
      { transaction }
    );

    await transaction.commit();

    const orderDetails = await Order.findByPk(order.id, {
        include: [{ model: Payment, as: "payments" }],
    });

  return res.status(200).json(
    message(true, "Order created successfully", orderDetails)
  );
} catch (error) {
  if (!transaction.finished) {
    await transaction.rollback();
  }
  next(error);
}
};

// Get order by ID with all relations
const getOne = async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: Payment,
        as: "payments",
      },
      {
        model: Account,
        as: "accountDetails",
        attributes: ["id", "email"],
      },
      {
        model: OrderHistory,
        as: "orderHistory",
        order: [["createdAt", "DESC"]],
      },
    ],
  });
  if (!order) {
    throw boom.notFound("Order not found");
  }
  return res.status(200).json(
    message(true, "Order created successfully", order)
  );
};

// get all orders
const getAll = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;
    const count = await Order.count();
    const rows = await Order.findAll({
      order: [["createdAt", "DESC"]],
      limit: parseInt(pageSize, 10),
      offset,
    });
    return res
      .status(200)
      .json(message(true, "Orders retrieved successfully", rows, count));
  } catch (error) {
    next(error);
  }
};

// Update order
const updateOne = async (req, res, next) => {
  const { id } = req.params;
  const { items, status, paymentMethod, email, ...bodyData } = req.body;

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Fetch existing order
    const order = await Order.findByPk(id, {
      include: [OrderItem, Payment],
      transaction,
    });

    if (!order) {
      throw boom.notFound("Order not found");
    }

    // Validate order can be modified
    if (order.status === "completed" || order.status === "cancelled") {
      throw boom.badRequest("Order cannot be modified in its current state");
    }

    // Account verification
    const accountId = req?.account?.id;
    if (order.accountId !== accountId) {
      throw boom.unauthorized("Not authorized to update this order");
    }

    // Initialize update object
    const orderUpdates = {};
    const paymentUpdates = {};

    // Process address updates if provided
    const processAddressUpdate = async (type) => {
      const id = bodyData[`${type}AddressId`];
      const snapshot = bodyData[`${type}AddressSnapshot`];

      if (!id && !snapshot) return;

      let addressSnapshot;
      let addressId;

      if (id) {
        const address = await Address.findByPk(id, {
          where: { accountId },
          transaction,
        });
        if (!address) throw boom.badRequest(`Invalid ${type} address ID`);
        addressSnapshot = address.toJSON();
        addressId = id;
      } else {
        const newAddress = await Address.create(
          {
            accountId,
            type,
            ...snapshot,
          },
          { transaction }
        );
        addressId = newAddress.id;
        addressSnapshot = newAddress.toJSON();
      }

      orderUpdates[`${type}AddressId`] = addressId;
      orderUpdates[`${type}AddressSnapshot`] = addressSnapshot;
    };

    if (bodyData.shippingAddressId || bodyData.shippingAddressSnapshot) {
      await processAddressUpdate("shipping");
    }

    if (bodyData.billingAddressId || bodyData.billingAddressSnapshot) {
      await processAddressUpdate("billing");
    }

    // Process item updates if provided
    if (items && items.length) {
      // Validate products
      const productIds = items.map((item) => item.productId);
      const products = await Product.findAll({
        where: { id: productIds },
        attributes: ["id", "price", "name", "slug", "sku"],
        transaction,
      });

      if (products.length !== items.length) {
        throw boom.badRequest("One or more products are invalid");
      }

      const productMap = products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});

      // Delete existing order items
      await OrderItem.destroy({
        where: { orderId: id },
        transaction,
      });

      // Create new order items
      await OrderItem.bulkCreate(
        items.map((item) => {
          const product = productMap[item.productId];
          return {
            orderId: id,
            productId: item.productId,
            productSnapshot: {
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price: product.price,
            },
            quantity: item.quantity,
            unitPrice: product.price,
            total: item.quantity * product.price,
          };
        }),
        { transaction }
      );

      // Recalculate totals
      const subtotal = items.reduce((sum, item) => {
        const product = productMap[item.productId];
        return sum + item.quantity * product.price;
      }, 0);

      orderUpdates.subtotal = subtotal;
      orderUpdates.tax = subtotal * 0.1; // Recalculate tax
      orderUpdates.total =
        subtotal + orderUpdates.tax + order.shippingCost - order.discount;
    }

    // Handle status changes
    if (status && status !== order.status) {
      orderUpdates.status = status;

      // Add status change to history
      await OrderHistory.create(
        {
          orderId: id,
          status,
          performedBy: accountId,
          note: `Status changed from ${order.status} to ${status}`,
        },
        { transaction }
      );
    }

    // Handle payment method changes
    if (paymentMethod && paymentMethod !== order.Payment.method) {
      paymentUpdates.method = paymentMethod;
      paymentUpdates.status = paymentMethod === "cod" ? "pending" : "unpaid";
    }

    // Update order if there are changes
    if (Object.keys(orderUpdates).length > 0) {
      await order.update(orderUpdates, { transaction });
    }

    // Update payment if there are changes
    if (Object.keys(paymentUpdates).length > 0) {
      await order.Payment.update(paymentUpdates, { transaction });
    }

    // Add general update history if any changes were made
    if (
      Object.keys(orderUpdates).length > 0 ||
      Object.keys(paymentUpdates).length > 0
    ) {
      await OrderHistory.create(
        {
          orderId: id,
          status: orderUpdates.status || order.status,
          performedBy: accountId,
          note: "Order updated",
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Return updated order
    return await this.getOrderById(id, transaction);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Cancel order
const updateStatus = async (req, res, next) => {
  const { orderId, status, reason = "" } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, { transaction });
    if (!order) throw boom.notFound("Order not found");

    if (
      ![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status) &&
      status === "cancelled"
    ) {
      throw boom.badRequest("Order status can't be change to " + status);
    }

    // Update order status
    order.status = status;
    await order.save({ transaction });

    // Create history entry
    await OrderHistory.create(
      {
        orderId: order.id,
        status: status,
        performedBy: req.user.id,
        performerInfo: {
          email: req?.user?.email,
          role: req?.user?.role,
        },
        note: reason || "Order has been marked as " + status,
      },
      { transaction }
    );

    await transaction.commit();

    return this.getOrderById(orderId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const addOrderItems = async (req, res, next) => {
  const { id } = req.params;
  const { items } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Validate input
    if (!items || !items.length) {
      throw boom.badRequest("At least one item is required");
    }

    // Get order with existing items
    const order = await Order.findByPk(id, {
      include: [OrderItem, Payment],
      transaction,
    });

    if (!order) {
      throw boom.notFound("Order not found");
    }

    // Validate order state
    if (
      [
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.CANCELLED,
      ].includes(order.status)
    ) {
      throw boom.badRequest("Order cannot be modified in its current state");
    }

    // Verify ownership
    if (order.accountId !== req.account.id) {
      throw boom.unauthorized();
    }

    // Validate products
    const productIds = items.map((item) => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ["id", "price", "name", "slug", "sku"],
      transaction,
    });

    if (products.length !== items.length) {
      throw boom.badRequest("One or more products are invalid");
    }

    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    // Create new order items
    const newItems = items.map((item) => {
      const product = productMap[item.productId];
      return {
        orderId: id,
        productId: product.id,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price,
        },
        quantity: item.quantity,
        unitPrice: product.price,
        total: item.quantity * product.price,
      };
    });

    await OrderItem.bulkCreate(newItems, { transaction });

    // Recalculate totals
    const allItems = await OrderItem.findAll({
      where: { orderId: id },
      transaction,
    });

    const subtotal = allItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // Recalculate tax
    const total = subtotal + tax + order.shippingCost - order.discount;

    // Update order totals
    await order.update(
      {
        subtotal,
        tax,
        total,
      },
      { transaction }
    );

    // Update payment amount
    await order.Payment.update(
      {
        amount: total,
      },
      { transaction }
    );

    // Add history entry
    await OrderHistory.create(
      {
        orderId: id,
        status: order.status,
        performedBy: req.account.id,
        note: `Added ${items.length} item(s) to order`,
      },
      { transaction }
    );

    await transaction.commit();
    return await this.getOrderById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const removeOrderItems = async (req, res, next) => {
  const { id } = req.params;
  const { itemIds } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Validate input
    if (!itemIds || !itemIds.length) {
      throw boom.badRequest("At least one item ID is required");
    }

    // Get order with items
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          where: { id: itemIds },
        },
        Payment,
      ],
      transaction,
    });

    if (!order) {
      throw boom.notFound("Order not found");
    }

    // Validate order state
    if (["completed", "cancelled", "shipped"].includes(order.status)) {
      throw boom.badRequest("Order cannot be modified in its current state");
    }

    // Verify ownership
    if (order.accountId !== req.account.id) {
      throw boom.unauthorized();
    }

    // Verify all requested items exist in order
    if (order.OrderItems.length !== itemIds.length) {
      throw boom.badRequest("One or more items not found in order");
    }

    // Delete items
    await OrderItem.destroy({
      where: {
        id: itemIds,
        orderId: id,
      },
      transaction,
    });

    // Recalculate totals
    const remainingItems = await OrderItem.findAll({
      where: { orderId: id },
      transaction,
    });

    const subtotal = remainingItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax + order.shippingCost - order.discount;

    // Update order totals
    await order.update(
      {
        subtotal,
        tax,
        total,
      },
      { transaction }
    );

    // Update payment amount
    await order.Payment.update(
      {
        amount: total,
      },
      { transaction }
    );

    // Add history entry
    await OrderHistory.create(
      {
        orderId: id,
        status: order.status,
        performedBy: req.account.id,
        note: `Removed ${itemIds.length} item(s) from order`,
      },
      { transaction }
    );

    await transaction.commit();
    return await this.getOrderById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    await order.destroy();
    return res.status(200).json(message(true, "order deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getOne,
  getAll,
  updateOne,
  updateStatus,
  deleteOne,
};
