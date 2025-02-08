const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./index');

const currency = ['USD', 'AED', 'GBP'];

// product_pricing.js
const ProductPricing = sequelize.define('ProductPricing', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: 'id'
      }
    },
    currency: {
        type: DataTypes.STRING,
        validate: {
          isIn: [currency]
        },
        allowNull: false
    },
    discountType: {
        type: DataTypes.STRING, // Added missing type
        allowNull: true,
        validate: {
            isIn: [['percentage', 'fixed']]
        },
    },
    discountValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: {
          min: 0
        }
    },
    costPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0
        }
    },
    basePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    finalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'product_pricing',
    timestamps: true,
    indexes: [
      { fields: ['productId', 'currency'] },
      { fields: ['currency'] }
    ]
  });

Product.hasMany(ProductPricing, {foreignKey: 'productId', as: 'pricing'});
ProductPricing.belongsTo(Product);

module.exports = ProductPricing; // Corrected the export statement