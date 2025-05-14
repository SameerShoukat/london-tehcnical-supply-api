const _ = require("lodash");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const {Purchase, PURCHASE_STATUS} = require('../models/products/purchase');
const Vendor = require('../models/vendor');
const User = require('../models/users');
const sequelize = require("../config/database");
const { Op, where } = require("sequelize");
const {Product} =  require("../models/products")




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

async function getPurchaseAnalytics(filters = {}) {
  try {
    const { startDate, endDate, vendorId, status, userId } = filters;
    
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
    
    if (vendorId) whereClause.vendorId = vendorId;
    if (status) whereClause.status = status;
    if (userId) whereClause.userId = userId;
    
    // Basic purchase stats
    const totalPurchases = await Purchase.count({ where: whereClause });
    
    if (totalPurchases === 0) {
      return {
        total_purchases: 0,
        total_amount: 0,
        average_purchase_value: 0,
        completed_purchases: 0,
        pending_purchases: 0,
        completion_rate: 0,
        payment_types: {},
        vendor_distribution: {},
        currency_distribution: {},
        purchase_trend: [],
        total_items_purchased: 0,
        average_items_per_purchase: 0
      };
    }
    
    // Aggregated monetary stats
    const monetaryStats = await Purchase.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total_amount'],
        [sequelize.fn('AVG', sequelize.col('totalAmount')), 'average_amount'],
        [sequelize.fn('SUM', sequelize.col('subTotal')), 'total_subtotal'],
        [sequelize.fn('SUM', sequelize.col('discount')), 'total_discount'],
        [sequelize.fn('SUM', sequelize.col('tax')), 'total_tax'],
        [sequelize.fn('SUM', sequelize.col('shipping')), 'total_shipping']
      ],
      raw: true
    });
    
    // Status distribution
    const statusDistribution = await Purchase.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    // Payment type distribution
    const paymentTypeDistribution = await Purchase.findAll({
      where: {
        ...whereClause,
        paymentType: { [Op.ne]: null }
      },
      attributes: [
        'paymentType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['paymentType'],
      raw: true
    });
    
    // Currency distribution
    const currencyDistribution = await Purchase.findAll({
      where: whereClause,
      attributes: [
        'currency',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']
      ],
      group: ['currency'],
      raw: true
    });
    
    // Vendor distribution (top vendors)
    const vendorDistribution = await Purchase.findAll({
      where: whereClause,
      attributes: [
        'vendorId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'purchase_count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total_spent']
      ],
      group: ['vendorId'],
      order: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    // Enrich with vendor names
    const vendorIds = vendorDistribution.map(v => v.vendorId);
    const vendors = vendorIds.length > 0 ? 
      await Vendor.findAll({
        where: { id: { [Op.in]: vendorIds } },
        attributes: ['id', 'email'],
        raw: true
      }) : [];
    
    const vendorMap = new Map(vendors.map(v => [v.id, v.name]));
    const enrichedVendorDistribution = vendorDistribution.map(v => ({
      vendorId: v.vendorId,
      vendorName: vendorMap.get(v.vendorId) || 'Unknown Vendor',
      purchase_count: Number(v.purchase_count),
      total_spent: Number(v.total_spent)
    }));
    
    // Purchase trend (by month)
    const purchaseTrend = await Purchase.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'amount']
      ],
      group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });
    
    // Item statistics
    const purchases = await Purchase.findAll({
      where: whereClause,
      attributes: ['id', 'items'],
      raw: true
    });
    
    let totalItems = 0;
    let itemCountByProduct = {};
    let itemSpendByProduct = {};
    
    purchases.forEach(purchase => {
      const items = purchase.items;
      if (Array.isArray(items)) {
        items.forEach(item => {
          totalItems += item.quantity || 0;
          
          // Count by product
          if (item.productId) {
            if (!itemCountByProduct[item.productId]) {
              itemCountByProduct[item.productId] = 0;
            }
            itemCountByProduct[item.productId] += item.quantity || 0;
            
            // Spend by product
            if (!itemSpendByProduct[item.productId]) {
              itemSpendByProduct[item.productId] = 0;
            }
            itemSpendByProduct[item.productId] += (item.quantity * item.costPrice) || 0;
          }
        });
      }
    });
    
    // Find top purchased products
    const topProductEntries = Object.entries(itemCountByProduct)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([productId, count]) => ({ productId, count }));
    
    // Get product names for top products
    const topProductIds = topProductEntries.map(entry => entry.productId);
    const topProducts = topProductIds.length > 0 ?
      await Product.findAll({
        where: { id: { [Op.in]: topProductIds } },
        attributes: ['id', 'name', 'sku'],
        raw: true
      }) : [];
    
    const productMap = new Map(topProducts.map(p => [p.id, { name: p.name, sku: p.sku }]));
    const enrichedTopProducts = topProductEntries.map(entry => ({
      productId: entry.productId,
      productName: productMap.get(entry.productId)?.name || 'Unknown Product',
      sku: productMap.get(entry.productId)?.sku || 'Unknown SKU',
      quantity: entry.count
    }));
    
    // Prepare status counts for easy access
    const statusCounts = {};
    statusDistribution.forEach(status => {
      statusCounts[status.status] = Number(status.count);
    });
    
    // Calculate completion rate
    const completedCount = statusCounts[PURCHASE_STATUS.COMPLETED] || 0;
    const completionRate = totalPurchases > 0 ? (completedCount / totalPurchases * 100).toFixed(2) : 0;
    
    // Format payment types
    const paymentTypes = {};
    paymentTypeDistribution.forEach(pt => {
      paymentTypes[pt.paymentType] = Number(pt.count);
    });
    
    // Format currency distribution
    const currencies = {};
    currencyDistribution.forEach(curr => {
      currencies[curr.currency] = {
        count: Number(curr.count),
        total: Number(curr.total)
      };
    });
    
    // Format purchase trend
    const formattedTrend = purchaseTrend.map(pt => ({
      month: pt.month,
      count: Number(pt.count),
      amount: Number(pt.amount)
    }));
    
    return {
      total_purchases: totalPurchases,
      total_amount: Number(monetaryStats[0].total_amount) || 0,
      average_purchase_value: Number(monetaryStats[0].average_amount) || 0,
      total_subtotal: Number(monetaryStats[0].total_subtotal) || 0,
      total_discount: Number(monetaryStats[0].total_discount) || 0,
      total_tax: Number(monetaryStats[0].total_tax) || 0,
      total_shipping: Number(monetaryStats[0].total_shipping) || 0,
      completed_purchases: completedCount,
      pending_purchases: statusCounts[PURCHASE_STATUS.PENDING] || 0,
      completion_rate: Number(completionRate),
      status_distribution: statusCounts,
      payment_types: paymentTypes,
      vendor_distribution: enrichedVendorDistribution,
      currency_distribution: currencies,
      purchase_trend: formattedTrend,
      total_items_purchased: totalItems,
      average_items_per_purchase: totalPurchases > 0 ? (totalItems / totalPurchases).toFixed(2) : 0,
      top_purchased_products: enrichedTopProducts
    };
  } catch (error) {
    console.error("Error in getPurchaseAnalytics:", error);
    throw error;
  }
}

// Example usage
async function runPurchaseAnalytics() {
  try {
    // Get all-time analytics
    const allTimeStats = await getPurchaseAnalytics();
    console.log("All-time Purchase Analytics:", allTimeStats);
    
    // // Get analytics for the current month
    // const now = new Date();
    // const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // const monthlyStats = await getPurchaseAnalytics({
    //   startDate: firstDayOfMonth,
    //   endDate: lastDayOfMonth
    // });
    // console.log("Monthly Purchase Analytics:", monthlyStats);
    
    // // Get analytics for a specific vendor
    // const vendorStats = await getPurchaseAnalytics({
    //   vendorId: 'some-vendor-id'
    // });
    // console.log("Vendor Purchase Analytics:", vendorStats);
    
    // // Get analytics for completed purchases only
    // const completedStats = await getPurchaseAnalytics({
    //   status: PURCHASE_STATUS.COMPLETED
    // });
    // console.log("Completed Purchase Analytics:", completedStats);
  } catch (error) {
    console.error("Failed to get purchase analytics:", error);
  }
}
runPurchaseAnalytics()




module.exports = {
    create,
    getAll,
    updateOne,
    getOne,
    deleteOne,
};