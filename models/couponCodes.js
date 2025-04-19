// models/CouponCode.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Website = require('./website');
const {CURRENCY} = require("../constant/types");

const CouponCode = sequelize.define('CouponCode', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        isIn: [['fixed', 'percentage']]
    },
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
    validate: {
      notEmpty: true,
    },
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        isIn: [Object.values(CURRENCY)]
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: {
        args: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
        msg: "Invalid URL format. Example valid URLs: example-domain.com, my-site123.org"
      }
    },
  },
  websiteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'websites',
      key: 'id',
    },
  },
}, {
  tableName: 'coupon_codes',
  timestamps: true,
  indexes: [{ fields: ['websiteId'] }],
});

CouponCode.belongsTo(Website, { foreignKey: 'websiteId', as: 'website' });
Website.hasMany(CouponCode, { foreignKey: 'websiteId', as: 'coupons' });

module.exports = CouponCode;
