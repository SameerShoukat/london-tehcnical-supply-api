
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./index');

// product_attributes.js
const ProductAttribute = sequelize.define('ProductAttribute', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {
    tableName: 'product_attributes',
    indexes: [
      { fields: ['productId'] },
      { fields: ['name'] }
    ]
});

Product.hasMany(ProductAttribute, {foreignKey: 'productId', as: 'attributes'});
ProductAttribute.belongsTo(Product);