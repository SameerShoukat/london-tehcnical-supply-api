// models/role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
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
    beforeCreate: async (category) => {
      category.slug = createSlug(category.name);    
    }
  }
});

module.exports = Category;