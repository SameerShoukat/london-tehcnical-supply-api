const {
  Order,
  OrderItem,
  Payment,
  Address,
  Account,
  OrderHistory,
} = require("../models/order-and-sale/index");
const { Op, where } = require("sequelize");
const sequelize = require("../config/database");
const _ = require("lodash");
const boom = require("@hapi/boom");
const {
  ORDER_STATUS,
  ORDER_PAYMENT_STATUS,
  CURRENCY_BY_COUNTRY,
  PAYMENT_STATUS,
} = require("../constant/types");
const { Product } = require("../models/products/index");
const {
  calculateFinalPrice,
  generatePassword,
  message,
} = require("../utils/hook");
const ProductPricing = require("../models/products/pricing");
const { getWebsiteIdByDomain } = require("./website");

const generateOrderNumber = async () => {
  const count = await Order.count();
  return `LTC-O-${count + 1}`;
};

const create = async (req, res, next) => {
  const requestCurrency = req?.meta?.currency;
  const domain = req.hostname || req.headers.host;
  const website = await getWebsiteIdByDomain(domain);
  let {
    items,
    email,
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingCost: shipping = 0,
    tax: taxAmount = 0,
    discount = 0,
  } = req.body;

  if (!items || !items.length) {
    return next(boom.badRequest("At least one order item is required"));
  }

  const transaction = await sequelize.transaction();

  try {
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
      }
      if (!addr?.addressSnapshot) {
        throw boom.badRequest(`${type} address snapshot is required`);
      }
      return addr.addressSnapshot;
    };

    const shippingAddressSnapshot = await getAddressSnapshot(
      shippingAddress,
      "shipping"
    );
    const billingAddressSnapshot = await getAddressSnapshot(
      billingAddress,
      "billing"
    );

    if (!shippingAddressSnapshot?.country) {
      throw boom.badImplementation("Shipping country not found");
    }

    const currency =
      CURRENCY_BY_COUNTRY[shippingAddressSnapshot.country] || "USD";
    if (requestCurrency !== currency) {
      throw boom.forbidden(
        `Currency must be ${currency} for orders shipping to ${shippingAddressSnapshot.country}`
      );
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ["id", "name", "sku", "inStock"],
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

    const productMap = {};
    const outOfStock = [];
    const insufficientStock = [];

    for (const product of products) {
      const orderItem = items.find((item) => item.productId === product.id);
      if (!product.inStock) {
        outOfStock.push(product);
      } else if (product.inStock < orderItem.quantity) {
        insufficientStock.push({
          ...product.toJSON(),
          requested: orderItem.quantity,
        });
      } else {
        const pricing = product.productPricing[0];
        const { productPrice, productDiscount } = calculateFinalPrice(pricing);
        discount += productDiscount;
        productMap[product.id] = {
          ...product.toJSON(),
          price: productPrice,
          discount: productDiscount,
        };
      }
    }

    if (outOfStock.length) {
      throw boom.badRequest(
        `Out of stock: ${outOfStock.map((p) => p.name).join(", ")}`
      );
    }

    if (insufficientStock.length) {
      throw boom.badRequest(
        `Insufficient stock: ${insufficientStock
          .map(
            (p) =>
              `${p.name} (requested: ${p.requested}, available: ${p.inStock})`
          )
          .join(", ")}`
      );
    }

    if (products.length !== items.length) {
      throw boom.badRequest("Some products are invalid");
    }

    const enrichedItems = items.map((item) => {
      const product = productMap[item.productId];
      return {
        ...item,
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
        discount: Number(product.discount),
      };
    });

    const subtotal = Number(
      enrichedItems
        .reduce((sum, item) => sum + item.quantity * item.price, 0)
        .toFixed(2)
    );
    const tax = Number((subtotal * taxAmount).toFixed(2));
    const total = Number((subtotal + tax + shipping - discount).toFixed(2));
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
        tax,
        shippingCost: Number(shipping),
        discount: Number(discount),
        currency,
        total,
        type: "website",
      },
      { transaction }
    );

    await Promise.all(
      items.map((item) => {
        const product = productMap[item.productId];
        return Product.update(
          {
            inStock: product.inStock - item.quantity,
            saleStock: (product.saleStock || 0) + item.quantity,
          },
          {
            where: { id: item.productId },
            transaction,
          }
        );
      })
    );

    if (paymentMethod !== "cod") {
      await Payment.create(
        {
          orderId: order.id,
          amount: total,
          currency,
          method: paymentMethod,
          status: "unpaid",
        },
        { transaction }
      );
    }

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

    return res
      .status(200)
      .json(message(true, "Order created successfully", orderDetails));
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    next(error);
  }
};

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
  return res
    .status(200)
    .json(message(true, "Order created successfully", order));
};

const getOneByOrderNumber = async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findOne({
    where: { orderNumber: orderId },
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
  return res
    .status(200)
    .json(message(true, "Order created successfully", order));
};

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
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

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

    return res
      .status(200)
      .json(message(true, "Order status updated successfully", order));
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  const { orderId, status, reason = "" } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, { transaction });
    if (!order) throw boom.notFound("Order not found");

    if (
      order.paymentStatus === PAYMENT_STATUS.PAID &&
      order.status === ORDER_STATUS.DELIVERED &&
      status !== "unpaid"
    ) {
      throw boom.badRequest(
        "Delivered Order payment status can't be change to " +
          status +
          "You have to marked that as returned"
      );
    }

    // Update order status
    order.paymentStatus = status;
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

    const updatedOrder = await Order.findByPk(orderId);
    return res
      .status(200)
      .json(message(true, "Payment status updated successfully", updatedOrder));
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
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

const reviewOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, currency } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      throw boom.badRequest("At least one order item is required");
    }

    // Validate products and get pricing
    const productIds = items.map((item) => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ["id", "name", "sku", "inStock", "inStock"],
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
    });

    // Check stock and enrich items with pricing
    const outOfStockProducts = [];
    const insufficientStockProducts = [];
    let totalDiscount = 0;

    const enrichedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw boom.badRequest(`Invalid product ID: ${item.productId}`);
      }

      if (!product.inStock) {
        outOfStockProducts.push(product);
      } else if (product.inStock < item.quantity) {
        insufficientStockProducts.push({
          ...product.toJSON(),
          requested: item.quantity,
          available: product.inStock,
        });
      }

      const pricing = product.productPricing[0];
      const { productPrice, productDiscount } = calculateFinalPrice(
        pricing.dataValues
      );
      totalDiscount += productDiscount;

      return {
        ...item,
        price: +productPrice,
        discount: +productDiscount,
        name: product.name,
        sku: product.sku,
      };
    });

    // Handle stock errors
    if (outOfStockProducts.length) {
      throw boom.badRequest(
        `Products out of stock: ${outOfStockProducts
          .map((p) => p.name)
          .join(", ")}`
      );
    }

    if (insufficientStockProducts.length) {
      throw boom.badRequest(
        `Insufficient stock for: ${insufficientStockProducts
          .map(
            (p) =>
              `${p.name} (requested: ${p.requested}, available: ${p.available})`
          )
          .join(", ")}`
      );
    }

    // Calculate totals
    const subtotal = enrichedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const { shippingCost = 0, tax = 0, discount = 0 } = req.body;
    const total = subtotal + tax + shippingCost - discount;

    return res.status(200).json(
      message(true, "Order reviewed successfully", {
        items: enrichedItems,
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        currency,
      })
    );
  } catch (error) {
    next(error);
  }
};

const createManualOrder = async (req, res, next) => {
  const {
    items,
    email,
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingCost = 0,
    tax = 0,
    discount = 0,
    customerNotes,
    currency,
    paymentStatus,
  } = req.body;

  // Validate required fields
  if (!items || !items.length) {
    throw boom.badRequest("At least one order item is required");
  }

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
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

    if (!shippingAddress?.country)
      throw boom.badImplementation("Country not found");

    const productIds = items.map((item) => item.productId);

    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ["id", "name", "sku", "inStock"],
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

    const outOfStockProducts = [];
    const insufficientStockProducts = [];
    let totalDiscount = 0;

    const enrichedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw boom.badRequest(`Invalid product ID: ${item.productId}`);
      }

      if (!product.inStock) {
        outOfStockProducts.push(product);
      } else if (product.inStock < item.quantity) {
        insufficientStockProducts.push({
          ...product.toJSON(),
          requested: item.quantity,
          available: product.inStock,
        });
      }

      const pricing = product.productPricing[0];
      const { productPrice, productDiscount } = calculateFinalPrice(
        pricing.dataValues
      );
      totalDiscount += productDiscount;

      return {
        ...item,
        price: +productPrice,
        discount: +productDiscount,
        name: product.name,
        sku: product.sku,
      };
    });

    // Handle stock errors
    if (outOfStockProducts.length > 0) {
      throw boom.badRequest(
        `The following products are out of stock: ${outOfStockProducts
          .map((p) => p.name)
          .join(", ")}`
      );
    }

    if (insufficientStockProducts.length > 0) {
      throw boom.badRequest(
        `Insufficient stock for: ${insufficientStockProducts
          .map(
            (p) =>
              `${p.name} (requested: ${p.requested}, available: ${p.available})`
          )
          .join(", ")}`
      );
    }

    const subtotal = enrichedItems.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);

    const total =
      Number(subtotal) + Number(tax) + Number(shippingCost) - Number(discount);
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await Order.create(
      {
        accountId,
        orderNumber,
        shippingAddressSnapshot: shippingAddress,
        billingAddressSnapshot: billingAddress ?? null,
        subtotal,
        items: enrichedItems,
        tax: Number(tax),
        shippingCost: Number(shippingCost),
        discount: Number(discount),
        currency,
        total: Number(total),
        customerNotes,
        paymentStatus,
      },
      { transaction }
    );

    // Update product stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      await Product.update(
        {
          inStock: Number(product.inStock) - Number(item.quantity),
        },
        {
          where: { id: item.productId },
          transaction,
        }
      );
    }

    if (paymentMethod !== "cod") {
      await Payment.create(
        {
          orderId: order.id,
          amount: total,
          currency,
          method: paymentMethod,
          status: paymentStatus,
        },
        { transaction }
      );
    }

    // Create order history
    await OrderHistory.create(
      {
        orderId: order.id,
        status: "created",
        performedBy: accountId,
        note: "Manual order created",
      },
      { transaction }
    );

    await transaction.commit();

    const orderDetails = await Order.findByPk(order.id, {
      include: [{ model: Payment, as: "payments" }],
    });

    return res
      .status(200)
      .json(message(true, "Manual order created successfully", orderDetails));
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

// order analytics:
const orderAnalytics = async (req, res, next) =>{
  try {
    const {startDate, endDate, website} = req.query;
    const response = await getOrderAnalytics({
      startDate,
      endDate,
      website
    });

    res.status(200).json(message(true, 'Order analytics retrieved successfully', response))
  } catch (error) {
    next(error)
  }
}


module.exports = {
  create,
  getOne,
  getAll,
  updateOne,
  updateStatus,
  deleteOne,
  getOneByOrderNumber,
  updatePaymentStatus,
  reviewOrder,
  createManualOrder,
  orderAnalytics
};


async function getOrderAnalytics(filters = {}) {
  try {
    const { startDate, endDate, website } = filters;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.createdAt = { [Op.lte]: new Date(endDate) };
    }
    if (website) whereClause.website = website;

    const totalOrders = await Order.count({ where: whereClause });

    if (totalOrders === 0) {
      return {
        period:
          startDate && endDate ? `${startDate} to ${endDate}` : "All time",
        total_orders: 0,
        total_sales: 0,
        average_order_value: 0,
        status_distribution: {},
        payment_status_distribution: {},
        website_distribution: {},
        order_type_distribution: {},
        coupon_usage: {
          orders_with_coupons: 0,
          coupon_usage_rate: 0,
          total_discount: 0,
          average_discount: 0,
          popular_coupons: [],
        },
        customer_analysis: {
          total_customers: 0,
          new_customers: 0,
          returning_customers: 0,
          top_customers: [],
        },
        currency_distribution: {},
      };
    }
    const allTotalAmountValues = await Order.findAll({ attributes: ["total"] });
    console.log(allTotalAmountValues);

    const monetaryStats = await Order.findAll({
      where: whereClause,
      attributes: [
        [sequelize.literal('COALESCE(SUM("total"), 0)'), "total_sales"],
        [sequelize.literal('COALESCE(AVG("total"), 0)'), "average_order_value"],
        [sequelize.literal('COALESCE(SUM("subtotal"), 0)'), "total_subtotal"],
        [sequelize.literal('COALESCE(SUM("discount"), 0)'), "total_discount"],
        [sequelize.literal('COALESCE(SUM("tax"), 0)'), "total_tax"],
        [
          sequelize.literal('COALESCE(SUM("shippingCost"), 0)'),
          "total_shipping",
        ],
      ],
      raw: true,
    });

    const statusDistribution = await Order.findAll({
      where: whereClause,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total")), "total"],
      ],
      group: ["status"],
      raw: true,
    });

    const paymentStatusDistribution = await Order.findAll({
      where: whereClause,
      attributes: [
        "paymentStatus",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total")), "total"],
      ],
      group: ["paymentStatus"],
      raw: true,
    });

    const orderTypeDistribution = await Order.findAll({
      where: whereClause,
      attributes: [
        "type",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total")), "total"],
      ],
      group: ["type"],
      raw: true,
    });

    const currencyDistribution = await Order.findAll({
      where: whereClause,
      attributes: [
        "currency",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total")), "total"],
      ],
      group: ["currency"],
      raw: true,
    });

    const couponStats = await Order.findAll({
      where: { ...whereClause, couponCode: { [Op.ne]: null } },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "coupon_orders"],
        [sequelize.fn("SUM", sequelize.col("discount")), "total_discount"],
        [sequelize.fn("AVG", sequelize.col("discount")), "average_discount"],
      ],
      raw: true,
    });

    const popularCoupons = await Order.findAll({
      where: { ...whereClause, couponCode: { [Op.ne]: null } },
      attributes: [
        "couponCode",
        [sequelize.fn("COUNT", sequelize.col("id")), "usage_count"],
        [sequelize.fn("SUM", sequelize.col("discount")), "total_discount"],
      ],
      group: ["couponCode"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      limit: 10,
      raw: true,
    });

    const topCustomers = await Order.findAll({
      where: {
        ...whereClause,
        accountId: { [Op.ne]: null },
      },
      attributes: [
        "accountId",
        [sequelize.fn("COUNT", sequelize.col("id")), "order_count"],
        [sequelize.fn("SUM", sequelize.col("total")), "total_spent"],
      ],
      group: ["accountId"],
      order: [[sequelize.fn("SUM", sequelize.col("total")), "DESC"]],
      limit: 5,
      raw: true,
    });

    const formattedStatusDistribution = {};
    statusDistribution.forEach((status) => {
      formattedStatusDistribution[status.status] = {
        count: Number(status.count),
        total: Number(status.total),
      };
    });

    const formattedPaymentStatusDistribution = {};
    paymentStatusDistribution.forEach((status) => {
      formattedPaymentStatusDistribution[status.paymentStatus] = {
        count: Number(status.count),
        total: Number(status.total),
      };
    });

    const formattedTypeDistribution = {};
    orderTypeDistribution.forEach((type) => {
      formattedTypeDistribution[type.type] = {
        count: Number(type.count),
        total: Number(type.total),
      };
    });

    const formattedCurrencyDistribution = {};
    currencyDistribution.forEach((curr) => {
      formattedCurrencyDistribution[curr.currency] = {
        count: Number(curr.count),
        total: Number(curr.total),
      };
    });

    const couponOrderCount = Number(couponStats[0]?.coupon_orders || 0);
    const couponUsageRate =
      totalOrders > 0 ? ((couponOrderCount / totalOrders) * 100).toFixed(2) : 0;

    const formattedPopularCoupons = popularCoupons.map((coupon) => ({
      code: coupon.couponCode,
      usage_count: Number(coupon.usage_count),
      total_discount: Number(coupon.total_discount),
      average_discount: (
        Number(coupon.total_discount) / Number(coupon.usage_count)
      ).toFixed(2),
    }));

    console.log(monetaryStats);

    return {
      period: startDate && endDate ? `${startDate} to ${endDate}` : "All time",
      total_orders: totalOrders,
      total_sales: Number(monetaryStats[0]?.total_sales || 0),
      average_order_value: Number(monetaryStats[0]?.average_order_value || 0),
      total_subtotal: Number(monetaryStats[0]?.total_subtotal || 0),
      total_discount: Number(monetaryStats[0]?.total_discount || 0),
      total_tax: Number(monetaryStats[0]?.total_tax || 0),
      total_shipping: Number(monetaryStats[0]?.total_shipping || 0),
      status_distribution: formattedStatusDistribution,
      payment_status_distribution: formattedPaymentStatusDistribution,

      order_type_distribution: formattedTypeDistribution,
      currency_distribution: formattedCurrencyDistribution,
      order_status_summary: {
        pending: formattedStatusDistribution[ORDER_STATUS.PENDING]?.count || 0,
        confirmed:
          formattedStatusDistribution[ORDER_STATUS.CONFIRMED]?.count || 0,
        processing:
          formattedStatusDistribution[ORDER_STATUS.PROCESSING]?.count || 0,
        on_hold: formattedStatusDistribution[ORDER_STATUS.ON_HOLD]?.count || 0,
        shipped: formattedStatusDistribution[ORDER_STATUS.SHIPPED]?.count || 0,
        delivered:
          formattedStatusDistribution[ORDER_STATUS.DELIVERED]?.count || 0,
        cancelled:
          formattedStatusDistribution[ORDER_STATUS.CANCELLED]?.count || 0,
        returned:
          formattedStatusDistribution[ORDER_STATUS.RETURNED]?.count || 0,
      },
      coupon_usage: {
        orders_with_coupons: couponOrderCount,
        coupon_usage_rate: Number(couponUsageRate),
        total_discount: Number(couponStats[0]?.total_discount || 0),
        average_discount: Number(couponStats[0]?.average_discount || 0),
        popular_coupons: formattedPopularCoupons,
      },
      customer_analysis: topCustomers,
    };
  } catch (error) {
    console.error("Error in getOrderAnalytics:", error);
    throw error;
  }
}