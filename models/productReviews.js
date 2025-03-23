const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Product = require('../products');

const ProductReview = sequelize.define('ProductReview', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  content: {
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
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true,
  tableName: 'product_reviews',
  indexes: [
    { fields: ['productId'] },
    { fields: ['userId'] },
    { fields: ['rating'] }
  ]
});

ProductReview.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProductReview, { foreignKey: 'productId' });

module.exports = ProductReview;