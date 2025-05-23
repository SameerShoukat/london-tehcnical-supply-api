const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const ProductQuote = require("../models/products/quotes");
const { Product } = require("../models/products");

// Create a new quote request
const createQuote = async (req, res, next) => {
  try {
    const domain = req.hostname || req.headers.host;
    const website = await getWebsiteIdByDomain(domain);

    const payload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    payload["website"] = website;
    const quote = await ProductQuote.create(payload);
    return res
      .status(201)
      .json(message(true, "Quote request submitted successfully", quote));
  } catch (error) {
    next(error);
  }
};

// Get all quotes with optional filtering (admin function)
const getAllQuotes = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10, status, productId } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (productId) whereClause.productId = productId;

    const count = await ProductQuote.count({ where: whereClause });

    const rows = await ProductQuote.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(pageSize, 10),
      offset: parseInt(offset, 10),
    });

    return res
      .status(200)
      .json(
        message(true, "Quote requests retrieved successfully", rows, count)
      );
  } catch (error) {
    next(error);
  }
};

// Get a single quote by ID
const getOneQuote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quote = await ProductQuote.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!quote) throw boom.notFound("Quote request not found");

    return res
      .status(200)
      .json(message(true, "Quote request retrieved successfully", quote));
  } catch (error) {
    next(error);
  }
};

// Update a quote by ID (admin function)
const updateOneQuote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const quote = await ProductQuote.findByPk(id);
    if (!quote) throw boom.notFound("Quote request not found");

    // Update the quote
    await quote.update(payload);

    return res
      .status(200)
      .json(message(true, "Quote request updated successfully", quote));
  } catch (error) {
    next(error);
  }
};

// Delete a quote by ID
const deleteOneQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quote = await ProductQuote.findByPk(id);

    if (!quote) {
      throw boom.notFound("Quote request not found");
    }
    await quote.destroy();
    return res
      .status(200)
      .json(message(true, "Quote request deleted successfully"));
  } catch (error) {
    next(error);
  }
};

// Update quote status (admin function)
const updateQuoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "contacted", "completed", "rejected"].includes(status)) {
      throw boom.badRequest("Invalid status value");
    }

    const quote = await ProductQuote.findByPk(id);
    if (!quote) throw boom.notFound("Quote request not found");

    // Update the status
    await quote.update({ status });

    return res
      .status(200)
      .json(message(true, "Quote status updated successfully", quote));
  } catch (error) {
    next(error);
  }
};

// Get quotes for logged in user
const getUserQuotes = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;

    const whereClause = {
      [sequelize.Op.or]: [{ email: req.user.email }],
    };

    // Get the total count of matching rows
    const count = await ProductQuote.count({ where: whereClause });

    // Get the paginated rows
    const rows = await ProductQuote.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(pageSize, 10),
      offset: parseInt(offset, 10),
    });

    return res
      .status(200)
      .json(
        message(true, "Your quote requests retrieved successfully", rows, count)
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuote,
  getAllQuotes,
  getOneQuote,
  updateOneQuote,
  deleteOneQuote,
  updateQuoteStatus,
  getUserQuotes,
};
