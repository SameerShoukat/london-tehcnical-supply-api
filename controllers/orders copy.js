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
const { ORDER_STATUS, ORDER_PAYMENT_STATUS, CURRENCY_BY_COUNTRY, PAYMENT_STATUS } = require("../constant/types");
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
  let shippingAddressSnapshot = "";
  let billingAddressSnapshot = "";
  let {
    items,
    email,
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingCost: shipping = 0,
    tax : taxAmount = 0,
    discount = 0
  } = req.body;
  const domain = req.hostname || req.headers.host;
  const website = await getWebsiteIdByDomain(domain);

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

    if(!shippingAddressSnapshot?.country) throw boom.badImplementation("Country not found")

    const currency = CURRENCY_BY_COUNTRY[shippingAddress?.country] || 'USD'

    if (requestCurrency !== currency) {
      throw boom.forbidden(
        `Currency must be ${currency} for orders shipping to ${shippingAddress.country}`
      );
    }
    
    // Validate products and calculate totals
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
      transaction,
    });

    // Check if all products are in stock
    const outOfStockProducts = [];
    const insufficientStockProducts = [];

    products.forEach((product) => {
      const orderItem = items.find((item) => item.productId === product.id);

      if (!product.inStock) {
        outOfStockProducts.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
        });
      } else if (product.inStock < orderItem.quantity) {
        insufficientStockProducts.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          requested: orderItem.quantity,
          available: product.inStock,
        });
      }

      const pricing = product.productPricing[0];
      const { productPrice, productDiscount } = calculateFinalPrice(
        pricing.dataValues
      );
      discount += productDiscount;
      product.price = +productPrice;
      product.discount = +productDiscount;
      delete product.productPricing;
    });

    // Return error if any products are out of stock
    if (outOfStockProducts.length > 0) {
      throw boom.badRequest(
        `The following products are out of stock: ${outOfStockProducts
          .map((p) => p.name)
          .join(", ")}`
      );
    }

    // Return error if any products have insufficient stock
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
        tax: Number(tax),
        shippingCost: Number(shipping),
        discount: Number(discount),
        currency,
        total: Number(total),
        type : 'website'
      },
      { transaction }
    );

    // Update product stock quantities
    for (const item of items) {
      const product = productMap[item.productId];
      const productInStock = Number(product.inStock) || 0
      const productSaleStock = Number(product.saleStock) || 0
      await Product.update(
        {
                    inStock: productInStock - Number(item.quantity),
                  saleStock: productSaleStock + Number(item.quantity)
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
          status: paymentMethod === "cod" ? "pending" : "unpaid",
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
    if (!transaction.finished) {
      await transaction.rollback();
    }
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
       order.paymentStatus === PAYMENT_STATUS.PAID &&  order.status === ORDER_STATUS.DELIVERED  &&
      status !== "unpaid"
    ) {
      throw boom.badRequest(
        "Delivered Order payment status can't be change to " + status + "You have to marked that as returned"
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
      include: [{
        model: ProductPricing,
        as: "productPricing",
        attributes: ["currency", "discountType", "discountValue", "basePrice", "finalPrice"],
        where: { currency },
        required: true
      }]
    });

    // Check stock and enrich items with pricing
    const outOfStockProducts = [];
    const insufficientStockProducts = [];
    let totalDiscount = 0;

    const enrichedItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw boom.badRequest(`Invalid product ID: ${item.productId}`);
      }

      if (!product.inStock) {
        outOfStockProducts.push(product);
      } else if (product.inStock < item.quantity) {
        insufficientStockProducts.push({
          ...product.toJSON(),
          requested: item.quantity,
          available: product.inStock
        });
      }

      const pricing = product.productPricing[0];
      const { productPrice, productDiscount } = calculateFinalPrice(pricing.dataValues);
      totalDiscount += productDiscount;

      return {
        ...item,
        price: +productPrice,
        discount: +productDiscount,
        name: product.name,
        sku: product.sku
      };
    });

    // Handle stock errors
    if (outOfStockProducts.length) {
      throw boom.badRequest(`Products out of stock: ${outOfStockProducts.map(p => p.name).join(', ')}`);
    }

    if (insufficientStockProducts.length) {
      throw boom.badRequest(`Insufficient stock for: ${insufficientStockProducts.map(p => 
        `${p.name} (requested: ${p.requested}, available: ${p.available})`).join(', ')}`);
    }

    // Calculate totals
    const subtotal = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const { shippingCost = 0, tax = 0, discount = 0 } = req.body;
    const total = subtotal + tax + shippingCost - discount;

    return res.status(200).json(message(true, "Order reviewed successfully", {
      items: enrichedItems,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      currency
    }));

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
    paymentStatus
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

    if(!shippingAddress?.country) throw boom.badImplementation("Country not found")  

    const productIds = items.map((item) => item.productId);

    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ["id", "name", "sku", "inStock"],
      include: [
        {
          model: ProductPricing,
          as: "productPricing",
          attributes: ["currency", "discountType", "discountValue", "basePrice", "finalPrice"],
          where: { currency },
          required: true,
        },
      ],
      transaction,
    });


    const outOfStockProducts = [];
    const insufficientStockProducts = [];
    let totalDiscount = 0;

    const enrichedItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw boom.badRequest(`Invalid product ID: ${item.productId}`);
      }

      if (!product.inStock) {
        outOfStockProducts.push(product);
      } else if (product.inStock < item.quantity) {
        insufficientStockProducts.push({
          ...product.toJSON(),
          requested: item.quantity,
          available: product.inStock
        });
      }

      const pricing = product.productPricing[0];
      const { productPrice, productDiscount } = calculateFinalPrice(pricing.dataValues);
      totalDiscount += productDiscount;

      return {
        ...item,
        price: +productPrice,
        discount: +productDiscount,
        name: product.name,
        sku: product.sku
      };
    });

    // Handle stock errors
    if (outOfStockProducts.length > 0) {
      throw boom.badRequest(
        `The following products are out of stock: ${outOfStockProducts.map(p => p.name).join(", ")}`
      );
    }

    if (insufficientStockProducts.length > 0) {
      throw boom.badRequest(
        `Insufficient stock for: ${insufficientStockProducts.map(p => 
          `${p.name} (requested: ${p.requested}, available: ${p.available})`).join(", ")}`
      );
    }

    const subtotal = enrichedItems.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);

    const total = Number(subtotal) + Number(tax) + Number(shippingCost) - Number(discount);
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
        paymentStatus
      },
      { transaction }
    );

    // Update product stock
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      await Product.update(
        { 
          inStock: Number(product.inStock) - Number(item.quantity)
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
async function getOrderAnalytics(filters = {}) {
  try {
    const {
      startDate,
      endDate,
      accountId,
      status,
      paymentStatus,
      website,
      type,
      couponCode
    } = filters;
    
    // Build where clause based on filters
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.createdAt = { [Op.lte]: new Date(endDate) };
    }
    
    if (accountId) whereClause.accountId = accountId;
    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    if (website) whereClause.website = website;
    if (type) whereClause.type = type;
    if (couponCode) whereClause.couponCode = { [Op.ne]: null };
    
    // Basic order counts
    const totalOrders = await Order.count({ where: whereClause });
    
    if (totalOrders === 0) {
      return {
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
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
          popular_coupons: []
        },
        customer_analysis: {
          total_customers: 0,
          new_customers: 0,
          returning_customers: 0,
          top_customers: []
        },
        sales_trend: [],
        currency_distribution: {}
      };
    }
    
    // Aggregated monetary stats
    const monetaryStats = await Order.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total_sales'],
        [sequelize.fn('AVG', sequelize.col('total')), 'average_order_value'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_subtotal'],
        [sequelize.fn('SUM', sequelize.col('discount')), 'total_discount'],
        [sequelize.fn('SUM', sequelize.col('tax')), 'total_tax'],
        [sequelize.fn('SUM', sequelize.col('shippingCost')), 'total_shipping']
      ],
      raw: true
    });
    
    // Status distribution
    const statusDistribution = await Order.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      group: ['status'],
      raw: true
    });
    
    // Payment status distribution
    const paymentStatusDistribution = await Order.findAll({
      where: whereClause,
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      group: ['paymentStatus'],
      raw: true
    });
    
    // Website distribution
    const websiteDistribution = await Order.findAll({
      where: {
        ...whereClause,
        website: { [Op.ne]: null }
      },
      attributes: [
        'website',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      group: ['website'],
      raw: true
    });
    
    // Order type distribution
    const orderTypeDistribution = await Order.findAll({
      where: whereClause,
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      group: ['type'],
      raw: true
    });
    
    // Currency distribution
    const currencyDistribution = await Order.findAll({
      where: whereClause,
      attributes: [
        'currency',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      group: ['currency'],
      raw: true
    });
    
    // Coupon analysis
    const couponStats = await Order.findAll({
      where: {
        ...whereClause,
        couponCode: { [Op.ne]: null }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'coupon_orders'],
        [sequelize.fn('SUM', sequelize.col('discount')), 'total_discount'],
        [sequelize.fn('AVG', sequelize.col('discount')), 'average_discount']
      ],
      raw: true
    });
    
    // Popular coupons
    const popularCoupons = await Order.findAll({
      where: {
        ...whereClause,
        couponCode: { [Op.ne]: null }
      },
      attributes: [
        'couponCode',
        [sequelize.fn('COUNT', sequelize.col('id')), 'usage_count'],
        [sequelize.fn('SUM', sequelize.col('discount')), 'total_discount']
      ],
      group: ['couponCode'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    // Customer analysis
    const customerStats = await Order.findAll({
      where: {
        ...whereClause,
        accountId: { [Op.ne]: null }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('accountId'))), 'customer_count']
      ],
      raw: true
    });
    
    // Orders per customer
    const customerOrderCounts = await Order.findAll({
      where: {
        ...whereClause,
        accountId: { [Op.ne]: null }
      },
      attributes: [
        'accountId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total_spent']
      ],
      group: ['accountId'],
      raw: true
    });
    
    // Identify new vs returning customers
    let newCustomers = 0;
    let returningCustomers = 0;
    
    // Get accounts with more than one order
    const accountCounts = {};
    customerOrderCounts.forEach(c => {
      accountCounts[c.accountId] = Number(c.order_count);
      if (Number(c.order_count) === 1) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    });
    
    // Top customers
    const topCustomers = customerOrderCounts
      .sort((a, b) => Number(b.order_count) - Number(a.order_count))
      .slice(0, 10)
      .map(c => ({
        accountId: c.accountId,
        order_count: Number(c.order_count),
        total_spent: Number(c.total_spent)
      }));
    
    // Enrich with account information if needed
    // This would require you to have an Account model available
    if (topCustomers.length > 0 && typeof Account !== 'undefined') {
      const accountIds = topCustomers.map(c => c.accountId);
      try {
        const accounts = await Account.findAll({
          where: { id: { [Op.in]: accountIds } },
          attributes: ['id', 'email'], // Adjust based on your Account model
          raw: true
        });
        
        const accountMap = new Map(accounts.map(a => [a.id, a]));
        
        topCustomers.forEach(customer => {
          const account = accountMap.get(customer.accountId);
          if (account) {
            customer.email = account.email;
            customer.name = account.name;
          }
        });
      } catch (error) {
        console.error("Error fetching account details:", error);
      }
    }
    
    // Sales trend by day/week/month
    let trendGrouping = 'day';
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 60) {
        trendGrouping = 'month';
      } else if (diffDays > 14) {
        trendGrouping = 'week';
      }
    }
    
    const salesTrend = await Order.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('date_trunc', trendGrouping, sequelize.col('createdAt')), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'sales_total']
      ],
      group: [sequelize.fn('date_trunc', trendGrouping, sequelize.col('createdAt'))],
      order: [[sequelize.fn('date_trunc', trendGrouping, sequelize.col('createdAt')), 'ASC']],
      raw: true
    });
    
    // Item analysis
    const orders = await Order.findAll({
      where: whereClause,
      attributes: ['id', 'items'],
      raw: true
    });
    
    let totalItems = 0;
    let productQuantities = {};
    
    orders.forEach(order => {
      const items = order.items;
      if (Array.isArray(items)) {
        items.forEach(item => {
          const quantity = Number(item.quantity) || 0;
          totalItems += quantity;
          
          // Count by product
          if (item.productId) {
            if (!productQuantities[item.productId]) {
              productQuantities[item.productId] = 0;
            }
            productQuantities[item.productId] += quantity;
          }
        });
      }
    });
    
    // Top selling products
    const topProducts = Object.entries(productQuantities)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([productId, quantity]) => ({ productId, quantity }));
    
    // Format status distribution for easy access
    const formattedStatusDistribution = {};
    statusDistribution.forEach(status => {
      formattedStatusDistribution[status.status] = {
        count: Number(status.count),
        total: Number(status.total)
      };
    });
    
    // Format payment status distribution
    const formattedPaymentStatusDistribution = {};
    paymentStatusDistribution.forEach(status => {
      formattedPaymentStatusDistribution[status.paymentStatus] = {
        count: Number(status.count),
        total: Number(status.total)
      };
    });
    
    // Format website distribution
    const formattedWebsiteDistribution = {};
    websiteDistribution.forEach(site => {
      formattedWebsiteDistribution[site.website || 'unknown'] = {
        count: Number(site.count),
        total: Number(site.total)
      };
    });
    
    // Format order type distribution
    const formattedTypeDistribution = {};
    orderTypeDistribution.forEach(type => {
      formattedTypeDistribution[type.type] = {
        count: Number(type.count),
        total: Number(type.total)
      };
    });
    
    // Format currency distribution
    const formattedCurrencyDistribution = {};
    currencyDistribution.forEach(curr => {
      formattedCurrencyDistribution[curr.currency] = {
        count: Number(curr.count),
        total: Number(curr.total)
      };
    });
    
    // Format sales trend
    const formattedSalesTrend = salesTrend.map(trend => ({
      period: trend.period,
      order_count: Number(trend.order_count),
      sales_total: Number(trend.sales_total)
    }));
    
    // Calculate coupon usage rate
    const couponOrderCount = Number(couponStats[0]?.coupon_orders || 0);
    const couponUsageRate = totalOrders > 0 ? (couponOrderCount / totalOrders * 100).toFixed(2) : 0;
    
    // Format popular coupons
    const formattedPopularCoupons = popularCoupons.map(coupon => ({
      code: coupon.couponCode,
      usage_count: Number(coupon.usage_count),
      total_discount: Number(coupon.total_discount),
      average_discount: (Number(coupon.total_discount) / Number(coupon.usage_count)).toFixed(2)
    }));
    
    // Prepare the final analytics object
    return {
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
      total_orders: totalOrders,
      total_sales: Number(monetaryStats[0]?.total_sales || 0),
      average_order_value: Number(monetaryStats[0]?.average_order_value || 0),
      total_subtotal: Number(monetaryStats[0]?.total_subtotal || 0),
      total_discount: Number(monetaryStats[0]?.total_discount || 0),
      total_tax: Number(monetaryStats[0]?.total_tax || 0),
      total_shipping: Number(monetaryStats[0]?.total_shipping || 0),
      total_items: totalItems,
      average_items_per_order: totalOrders > 0 ? (totalItems / totalOrders).toFixed(2) : 0,
      
      // Status distributions
      status_distribution: formattedStatusDistribution,
      payment_status_distribution: formattedPaymentStatusDistribution,
      website_distribution: formattedWebsiteDistribution,
      order_type_distribution: formattedTypeDistribution,
      currency_distribution: formattedCurrencyDistribution,
      
      // Summary by order status
      order_status_summary: {
        pending: formattedStatusDistribution[ORDER_STATUS.PENDING]?.count || 0,
        confirmed: formattedStatusDistribution[ORDER_STATUS.CONFIRMED]?.count || 0,
        processing: formattedStatusDistribution[ORDER_STATUS.PROCESSING]?.count || 0,
        on_hold: formattedStatusDistribution[ORDER_STATUS.ON_HOLD]?.count || 0,
        shipped: formattedStatusDistribution[ORDER_STATUS.SHIPPED]?.count || 0,
        delivered: formattedStatusDistribution[ORDER_STATUS.DELIVERED]?.count || 0,
        cancelled: formattedStatusDistribution[ORDER_STATUS.CANCELLED]?.count || 0,
        returned: formattedStatusDistribution[ORDER_STATUS.RETURNED]?.count || 0
      },
      
      // Summary by payment status
      payment_status_summary: {
        unpaid: formattedPaymentStatusDistribution[ORDER_PAYMENT_STATUS.UNPAID]?.count || 0,
        paid: formattedPaymentStatusDistribution[ORDER_PAYMENT_STATUS.PAID]?.count || 0,
        partially_paid: formattedPaymentStatusDistribution[ORDER_PAYMENT_STATUS.PARTIALLY_PAID]?.count || 0,
        refunded: formattedPaymentStatusDistribution[ORDER_PAYMENT_STATUS.REFUNDED]?.count || 0
      },
      
      // Coupon analysis
      coupon_usage: {
        orders_with_coupons: couponOrderCount,
        coupon_usage_rate: Number(couponUsageRate),
        total_discount: Number(couponStats[0]?.total_discount || 0),
        average_discount: Number(couponStats[0]?.average_discount || 0),
        popular_coupons: formattedPopularCoupons
      },
      
      // Customer analysis
      customer_analysis: {
        total_customers: Number(customerStats[0]?.customer_count || 0),
        new_customers: newCustomers,
        returning_customers: returningCustomers,
        top_customers: topCustomers
      },
      
      // Sales trend over time
      sales_trend: formattedSalesTrend,
      
      // Product analysis
      top_selling_products: topProducts
    };
  } catch (error) {
    console.error("Error in getOrderAnalytics:", error);
    throw error;
  }
}

// Helper function to get monthly stats
async function getMonthlyOrderStats(year, month) {
  const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
  const endDate = new Date(year, month, 0); // Last day of the month
  
  return await getOrderAnalytics({
    startDate,
    endDate
  });
}

// Helper function to get yearly stats
async function getYearlyOrderStats(year) {
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st
  
  return await getOrderAnalytics({
    startDate,
    endDate
  });
}

// Helper function to get daily sales report
async function getDailySalesReport(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await getOrderAnalytics({
    startDate: startOfDay,
    endDate: endOfDay
  });
}

// Example usage
async function runOrderAnalytics() {
  try {
    // Get April 2025 stats as requested
    const april2025Stats = await getMonthlyOrderStats(2025, 4);
    console.log("April 2025 Order Statistics:");
    console.log(`Total Sales: ${april2025Stats.total_sales}`);
    console.log(`Total Orders: ${april2025Stats.total_orders}`);
    console.log(`Completed Orders: ${april2025Stats.order_status_summary.delivered}`);
    console.log(`Returned Orders: ${april2025Stats.order_status_summary.returned}`);
    console.log(`Total Discount: ${april2025Stats.total_discount}`);
    console.log(`Orders with Coupons: ${april2025Stats.coupon_usage.orders_with_coupons}`);
    console.log("Order Type Breakdown:", april2025Stats.order_type_distribution);
    console.log("Most Active Customer:", april2025Stats.customer_analysis.top_customers[0]);
    
    // Current month stats (dynamic)
    const now = new Date();
    const currentMonthStats = await getMonthlyOrderStats(now.getFullYear(), now.getMonth() + 1);
    console.log(`Current Month Order Statistics: ${currentMonthStats.total_orders} orders, ${currentMonthStats.total_sales} in sales`);
    
    // Year to date stats
    const yearToDateStats = await getYearlyOrderStats(now.getFullYear());
    console.log(`Year-to-Date Statistics: ${yearToDateStats.total_orders} orders, ${yearToDateStats.total_sales} in sales`);
    
    // Today's sales
    const todaySales = await getDailySalesReport(now);
    console.log(`Today's Sales: ${todaySales.total_sales}`);
    
    // Get stats for specific website
    const websiteStats = await getOrderAnalytics({
      website: "example.com"
    });
    console.log(`Website Orders: ${websiteStats.total_orders}`);
    
    // Get stats for specific payment status
    const paidOrderStats = await getOrderAnalytics({
      paymentStatus: ORDER_PAYMENT_STATUS.PAID
    });
    console.log(`Paid Orders: ${paidOrderStats.total_orders}`);
  } catch (error) {
    console.error("Failed to get order analytics:", error);
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
  createManualOrder
};
