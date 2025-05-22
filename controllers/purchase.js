const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const { Purchase, PURCHASE_STATUS } = require("../models/products/purchase");
const Vendor = require("../models/vendor");
const User = require("../models/users");
const sequelize = require("../config/database");
const { Op, where } = require("sequelize");
const { Product } = require("../models/products");

// Create a new record
const create = async (req, res, next) => {
  try {
    const payload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    payload.userId = req.user.id;

    const vendor = await Purchase.create(payload);
    return res
      .status(201)
      .json(message(true, "Purchase added successfully", vendor));
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
          model: Vendor,
          as: "vendor",
          attributes: ["id", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(pageSize, 10),
      offset,
    });

    return res
      .status(200)
      .json(message(true, "Purchase retrieved successfully", rows, count));
  } catch (error) {
    next(error);
  }
};

// Get a single record by ID
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "firstName",
            "lastName",
            "email",
            "phone",
            "companyName",
          ],
        },
      ],
    });
    if (!purchase) throw boom.notFound("Purchase not found");
    return res
      .status(200)
      .json(message(true, "Purchase retrieved successfully", purchase));
  } catch (error) {
    next(error);
  }
};

// Update a record by ID
const updateOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    payload.userId = req.user.id;

    const purchase = await Purchase.findByPk(id);
    if (!purchase) throw boom.notFound("Purchase not found");

    // Update the purchase
    await purchase.update(payload);

    return res
      .status(200)
      .json(message(true, "Purchase updated successfully", purchase));
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
      throw boom.notFound("Purchase not found");
    }

    await purchase.destroy();

    return res.status(200).json(message(true, "Purchase deleted successfully"));
  } catch (error) {
    next(error);
  }
};

// Purchase analytics:
const purchaseAnalytics = async (req, res, next) => {
    try {
       const {startDate, endDate} = req.query
      const data = await getPurchaseAnalytics({startDate,endDate});
      res
        .status(200)
        .json(
          message(
            true,
            "Purchase analytics retrieved successfully",
            data
          )
        );
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
  purchaseAnalytics
};





function buildWhereClause({ startDate, endDate }) {
  const where = {};
  if (startDate && endDate)
    where.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  else if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
  else if (endDate) where.createdAt = { [Op.lte]: new Date(endDate) };
  return where;
}

async function getPurchaseAnalytics(filters = {}) {
  const whereClause = buildWhereClause(filters);

  const totalPurchases = await Purchase.count({ where: whereClause });
    if (totalPurchases === 0) return {
      "total_purchases": 0,
      "total_amount": 0,
      "total_subtotal": 0,
      "total_discount": 0,
      "total_tax": 0,
      "total_shipping": 0,
      "completed_purchases": 0,
      "pending_purchases": 0,
      "completion_rate": 0,
      "status_distribution": {
        "completed": 0
      },
      "payment_types": {
        "bank_transfer":0,
        "card": 0
      },
      "currency_distribution": {},
      "vendor_distribution": []
    }

  const [monetaryStats, statusDistribution, paymentTypes, currencies, vendors] =
    await Promise.all([
      getPurchaseMonetaryStats(whereClause),
      getPurchaseStatusDistribution(whereClause),
      getPaymentTypeDistribution(whereClause),
      getCurrencyDistribution(whereClause),
      getTopVendorsBySpend(whereClause),
    ]);

  return {
    ...monetaryStats,
    ...statusDistribution,
    payment_types: paymentTypes,
    currency_distribution: currencies,
    vendor_distribution: vendors,
  };
}

async function getPurchaseStatusDistribution(where) {
  const rows = await Purchase.findAll({
    where,
    attributes: [
      "status",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["status"],
    raw: true,
  });

  const statusCounts = Object.fromEntries(
    rows.map((r) => [r.status, Number(r.count)])
  );
  const completed = statusCounts[PURCHASE_STATUS.COMPLETED] || 0;
  const pending = statusCounts[PURCHASE_STATUS.PENDING] || 0;

  return {
    completed_purchases: completed,
    pending_purchases: pending,
    completion_rate: ((completed / (completed + pending)) * 100).toFixed(2),
    status_distribution: statusCounts,
  };
}

async function getPurchaseMonetaryStats(where) {
  const [stats] = await Purchase.findAll({
    where,
    attributes: [
      [sequelize.fn("SUM", sequelize.col("totalAmount")), "total_amount"],
      [sequelize.fn("SUM", sequelize.col("subTotal")), "total_subtotal"],
      [sequelize.fn("SUM", sequelize.col("discount")), "total_discount"],
      [sequelize.fn("SUM", sequelize.col("tax")), "total_tax"],
      [sequelize.fn("SUM", sequelize.col("shipping")), "total_shipping"],
    ],
    raw: true,
  });

  return {
    total_purchases: await Purchase.count({ where }),
    total_amount: Number(stats.total_amount) || 0,
    total_subtotal: Number(stats.total_subtotal) || 0,
    total_discount: Number(stats.total_discount) || 0,
    total_tax: Number(stats.total_tax) || 0,
    total_shipping: Number(stats.total_shipping) || 0,
  };
}

async function getPaymentTypeDistribution(where) {
  const rows = await Purchase.findAll({
    where: { ...where, paymentType: { [Op.ne]: null } },
    attributes: [
      "paymentType",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["paymentType"],
    raw: true,
  });

  return Object.fromEntries(rows.map((r) => [r.paymentType, Number(r.count)]));
}

async function getCurrencyDistribution(where) {
  const rows = await Purchase.findAll({
    where,
    attributes: [
      "currency",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      [sequelize.fn("SUM", sequelize.col("totalAmount")), "total"],
    ],
    group: ["currency"],
    raw: true,
  });

  return Object.fromEntries(
    rows.map((r) => [
      r.currency,
      { count: Number(r.count), total: Number(r.total) },
    ])
  );
}

async function getTopVendorsBySpend(where) {
  const vendorRows = await Purchase.findAll({
    where,
    attributes: [
      "vendorId",
      [sequelize.fn("COUNT", sequelize.col("id")), "purchase_count"],
      [sequelize.fn("SUM", sequelize.col("totalAmount")), "total_spent"],
    ],
    group: ["vendorId"],
    order: [[sequelize.fn("SUM", sequelize.col("totalAmount")), "DESC"]],
    limit: 5,
    raw: true,
  });

  const vendorIds = vendorRows.map((v) => v.vendorId);
  const vendors = await Vendor.findAll({
    where: { id: { [Op.in]: vendorIds } },
    attributes: ["id", "email"],
    raw: true,
  });

  const map = new Map(vendors.map((v) => [v.id, v.name]));
  return vendorRows.map((v) => ({
    vendorId: v.vendorId,
    vendorName: map.get(v.vendorId) || "Unknown Vendor",
    purchase_count: Number(v.purchase_count),
    total_spent: Number(v.total_spent),
  }));
}

