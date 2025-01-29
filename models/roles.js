const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { createSlug } = require('../utils/hook');

const PERMISSION_LEVELS = ['read', 'manage', 'delete', 'none'];
const USER_TYPES = ['admin', 'user'];

// Reusable validation function for permission arrays
const validatePermissionArray = (value) => {
  if (value && !value.every(permission => PERMISSION_LEVELS.includes(permission))) {
    throw new Error('Invalid permission level in array');
  }
};

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM(...USER_TYPES),
      defaultValue: 'user',
      validate: {
        isIn: [USER_TYPES],
      },
    },
    accounts: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...PERMISSION_LEVELS)),
      defaultValue: ['none'],
      validate: {
        isValidPermissionArray: validatePermissionArray,
      },
    },
    stocks: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...PERMISSION_LEVELS)),
      defaultValue: ['none'],
      validate: {
        isValidPermissionArray: validatePermissionArray,
      },
    },
    orders: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...PERMISSION_LEVELS)),
      defaultValue: ['none'],
      validate: {
        isValidPermissionArray: validatePermissionArray,
      },
    },
    finance: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...PERMISSION_LEVELS)),
      defaultValue: ['none'],
      validate: {
        isValidPermissionArray: validatePermissionArray,
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true, // Enables soft deletes
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

module.exports = Role;
