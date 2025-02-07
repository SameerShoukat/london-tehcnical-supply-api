const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { createSlug } = require('../utils/hook');

const Permission = sequelize.define(
  'Permission',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    accounts: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidArray(value) {
          if (value) {
            const validValues = ['view', 'manage', 'delete'];
            if (!value.every(item => validValues.includes(item))) {
              throw new Error('Accounts array can only contain "view", "manage", or "delete".');
            }
          }
        },
      },
    },
    stocks: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidArray(value) {
          if (value) {
            const validValues = ['view', 'manage', 'delete'];
            if (!value.every(item => validValues.includes(item))) {
              throw new Error('Stocks array can only contain "view", "manage", or "delete".');
            }
          }
        },
      },
    },
    orders: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidArray(value) {
          if (value) {
            const validValues = ['view', 'manage', 'delete'];
            if (!value.every(item => validValues.includes(item))) {
              throw new Error('Orders array can only contain "view", "manage", or "delete".');
            }
          }
        },
      },
    },
    finance: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        isValidArray(value) {
          if (value) {
            const validValues = ['view', 'manage', 'delete'];
            if (!value.every(item => validValues.includes(item))) {
              throw new Error('Finance array can only contain "view", "manage", or "delete".');
            }
          }
        },
      },
    },
  },
  {
    tableName: 'permissions',
    timestamps: true, // Enables createdAt and updatedAt
    hooks: {
      beforeCreate(instance) {
        instance.slug = createSlug(instance.name);
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