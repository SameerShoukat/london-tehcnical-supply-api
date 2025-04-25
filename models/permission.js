const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { createSlug } = require('../utils/hook');

// Define valid permission sets
const VALID_FULL_PERMS = Object.freeze(['view', 'manage', 'delete']);
const VALID_VIEW_ONLY = Object.freeze(['view']);

// Reusable validation helper
function validatePermissions(value, validValues, fieldName) {
  if (value) {
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} must be an array of strings.`);
    }
    if (!value.every(item => validValues.includes(item))) {
      throw new Error(
        `${fieldName} can only contain: ${validValues.map(v => `"${v}"`).join(', ')}.`
      );
    }
  }
}

const Permission = sequelize.define(
  'Permission',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    stocks: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidStocks(value) {
          validatePermissions(value, VALID_FULL_PERMS, 'Stocks');
        },
      },
    },
    orders: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidOrders(value) {
          validatePermissions(value, VALID_FULL_PERMS, 'Orders');
        },
      },
    },
    finance: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidFinance(value) {
          validatePermissions(value, VALID_FULL_PERMS, 'Finance');
        },
      },
    },
    purchase: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidPurchase(value) {
          validatePermissions(value, VALID_FULL_PERMS, 'Purchase');
        },
      },
    },
    customer_interaction: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidCustomerInteraction(value) {
          validatePermissions(value, VALID_FULL_PERMS, 'Customer Interaction');
        },
      },
    },
    analytics: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidAnalytics(value) {
          validatePermissions(value, VALID_VIEW_ONLY, 'Analytics');
        },
      },
    },
    setting: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidStocks(value) {
          validatePermissions(value, VALID_FULL_PERMS, 'Stocks');
        },
      },
    },
  },
  {
    tableName: 'permissions',
    timestamps: true,
    hooks: {
      beforeCreate(instance) {
        if (instance.name) {
          instance.slug = createSlug(instance.name);
        }
      },
      beforeUpdate(instance) {
        if (instance.name) {
          instance.slug = createSlug(instance.name);
        }
      },
    },
  }
);

module.exports = Permission;
