const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const {Product} = require('./index');
const Attribute = require('./attributes');

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
    attributeId: {  
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Attribute,
        key: 'id'
      }
    },
    value: {  
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {

    timestamps: true,
    tableName: 'product_attributes',
    indexes: [
      { fields: ['productId', 'value'] },
      { fields: ['attributeId', 'value'] },
      { unique: true, fields: ['productId', 'attributeId'] }  
    ]
});


Product.hasMany(ProductAttribute, { foreignKey: 'productId', as: 'productAttributes' });
ProductAttribute.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Attribute.hasMany(ProductAttribute, { foreignKey: 'attributeId', as: 'productAttributes' });
ProductAttribute.belongsTo(Attribute, { foreignKey: 'attributeId', as: 'attribute' });

module.exports = ProductAttribute;