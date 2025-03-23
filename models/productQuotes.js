const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Product = require('../products');

const ProductQuote = sequelize.define('ProductQuote', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'contacted', 'completed', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  paranoid: true,
  timestamps: true,
  tableName: 'product_quotes',
  indexes: [
    { fields: ['productId'] },
    { fields: ['email'] },
    { fields: ['status'] }
  ]
});

ProductQuote.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProductQuote, { foreignKey: 'productId' });
module.exports = ProductQuote;