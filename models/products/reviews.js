const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const {Product} = require('./index');

const REVIEW_STATUS = {
  PENDING : 'pending',
  APPROVED :  'approved',
  REJECTED : 'rejected'
}

const ProductReview = sequelize.define('ProductReview', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  rating: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
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
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
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
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(REVIEW_STATUS)]
    },
    defaultValue: REVIEW_STATUS.PENDING
  },
}, {
  timestamps: true,
  tableName: 'product_reviews',
  indexes: [
    { fields: ['productId'] },
    { fields: ['rating'] }
  ]
});

ProductReview.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'SET NULL'});
Product.hasMany(ProductReview, { foreignKey: 'productId' });

module.exports = ProductReview;