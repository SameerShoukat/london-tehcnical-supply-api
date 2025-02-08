
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// product_attributes.js
const Attribute = sequelize.define('Attribute', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
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
    tableName: 'attributes',
    indexes: [
      { fields: ['name'] }
    ]
});

module.exports = Attribute;
