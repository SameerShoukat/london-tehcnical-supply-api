// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const {ORDER_PAYMENT_STATUS, ORDER_STATUS, CURRENCY, PAYMENT_STATUS} = require("../../constant/types")
const Account = require("./account")

const Order = sequelize.define('Order', {
  id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
  },
  orderNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
  },
  accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Account,
          key: 'id',
        },
  },
  website : {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingAddressSnapshot: {
      type: DataTypes.JSONB,
      allowNull: false
  },
  billingAddressSnapshot: {
      type: DataTypes.JSONB,
      allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        isIn: [Object.values(CURRENCY)]
    },
  },
  subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
  },
  shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
  },
  tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
  },
  discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
  },
  total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        isIn: [Object.values(ORDER_STATUS)]
    },
    defaultValue: ORDER_STATUS.PENDING
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        isIn: [Object.values(ORDER_PAYMENT_STATUS)]
    },
    defaultValue: ORDER_PAYMENT_STATUS.UNPAID
  },
  metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
  },
  notes: {
      type: DataTypes.TEXT,
      allowNull: true
  },

}, {
  tableName: 'orders',
  paranoid: true,
  indexes: [
      { fields: ['accountId'] },
      { fields: ['createdAt'] },
      { fields: ['status', 'createdAt'] },
      { fields: ['paymentStatus', 'createdAt'] },
    ]
});

Order.belongsTo(Account, {foreignKey : 'accountId', as : 'accountDetails'})
Account.hasMany(Order, {foreignKey : 'accountId'})
module.exports = Order