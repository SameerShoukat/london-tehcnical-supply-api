const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const {Product} = require('./index');

const currency = ['USD', 'AED', 'GBP'];

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
    type: DataTypes.STRING,
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
  basePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
    min: 0
    }
  },
  finalPrice: {
    type: DataTypes.DECIMAL(12, 2),
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
  ],
  hooks: {
    beforeSave: (pricing) => {
    // Calculate final price whenever the record is created or updated
    if (pricing.basePrice) {
      if (pricing.discountType && pricing.discountValue) {
      if (pricing.discountType === 'percentage') {
        pricing.finalPrice = Number(pricing.basePrice) - (Number(pricing.basePrice) * (Number(pricing.discountValue) / 100));
      } else {
        pricing.finalPrice = Number(pricing.basePrice) - Number(pricing.discountValue);
      }
      } else {
      pricing.finalPrice = Number(pricing.basePrice);
      }
    }
    }
  }
});



ProductPricing.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProductPricing, { foreignKey: 'productId', as: 'productPricing' });


module.exports = ProductPricing;