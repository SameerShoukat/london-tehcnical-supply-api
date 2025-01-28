// models/role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Catalog = sequelize.define('Catalog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.BOOLEAN,
  }
}, {
  hooks: {
    beforeCreate: async (catalog) => {
      catalog.slug = createSlug(catalog.name);    
    }
  }
});

module.exports = Catalog;