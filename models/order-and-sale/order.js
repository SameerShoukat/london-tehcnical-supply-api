// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/database');
// const { createSlug } = require("../../utils/hook");
// const Account = require("../models/account")


// const ORDER_STATUS = {
//     DELIVERED: 'delivered',
//     CANCELLED: 'cancelled',
//     WAITING_FOR_DISPATCH: 'waiting_for_dispatch',
//     DISPATCHED: 'dispatch',
//     PAYMENT_PENDING: 'payment_pending',
//     PAID: 'paid',
//     RETURN: 'return'
// };

// const currency = ['USD', 'AED', 'GBP'];

// const Order = sequelize.define('Product', {
//     id: {
//       type: DataTypes.UUID,
//       primaryKey: true,
//       defaultValue: DataTypes.UUIDV4,
//       allowNull: false
//     },
//     orderId: {
//       type: DataTypes.STRING,
//       unique: true
//     },
//     totalAmount: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//         validate: {
//           min: 0
//         }
//       },
//     shippingAddress: {
//         type: DataTypes.JSONB,
//         allowNull: false
//     },
//     billingAddress: DataTypes.JSONB,
//     userId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: Account,
//         key: 'id'
//       }
//     }
//   }, {
//     tableName: 'products',
//     paranoid: true,
//     timestamps: true,
//     indexes: [
//       { unique: true, fields: ['slug'] },
//       { unique: true, fields: ['sku'] },
//       { fields: ['itemId'] },
//       { fields: ['status'] },
//       { fields: ['catalogId'] },
//       { fields: ['catId'] },
//       { fields: ['subCategoryId'] },
//       { fields: ['websiteId'] }
//     ],
//     hooks: {
//       beforeCreate: (product) => {
//         if (product.name) {
//           product.slug = createSlug(product.name);
//         }
//         if (!product.inStock) {
//           product.inStock = product.totalStock;
//         }
//       },
//       beforeUpdate: (product) => {
//         if (product.changed('name')) {
//           product.slug = createSlug(product.name);
//         }
//         if (product.changed()) {
//           product.version += 1;
//         }
//       }
//     }
// });

// // Define associations
// Product.belongsTo(Catalog, {foreignKey: 'catalogId', as: 'catalog'});
// Catalog.hasMany(Product, {foreignKey: 'catalogId'});

// Product.belongsTo(Category, {foreignKey: 'catId', as: 'category'});
// Category.hasMany(Product, {foreignKey: 'catId'});

// Product.belongsTo(SubCategory, {foreignKey: 'subCatId', as: 'subCategory'});
// SubCategory.hasMany(Product, {foreignKey: 'subCatId'});

// Product.belongsTo(Website, {foreignKey: 'websiteId', as: 'website'});
// Website.hasMany(Product, {foreignKey: 'websiteId'});

// Product.belongsTo(User, {foreignKey: 'userId', as: 'user'});
// User.hasMany(Product, {foreignKey: 'userId'});

// module.exports = {Order, ORDER_STATUS}

  