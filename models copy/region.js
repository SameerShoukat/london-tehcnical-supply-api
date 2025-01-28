// models/role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubCategory = sequelize.define('SubCategory', {
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

module.exports = SubCategory;