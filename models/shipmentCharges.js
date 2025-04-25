// models/ShipmentCharge.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Website = require('./website');
const {CURRENCY} = require("../constant/types");

const ShipmentCharge = sequelize.define('ShipmentCharge', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        isIn: [Object.values(CURRENCY)]
    },
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        isIn: [['fixed', 'percentage']]
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
    unique:false,
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
  tableName: 'shipment_charges',
  timestamps: true,
  indexes: [{ fields: ['websiteId'] }],
});

ShipmentCharge.belongsTo(Website, { foreignKey: 'websiteId', as: 'website' });
Website.hasMany(ShipmentCharge, { foreignKey: 'websiteId', as: 'shipmentCharges' });

module.exports = ShipmentCharge;
