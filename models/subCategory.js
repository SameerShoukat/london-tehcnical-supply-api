// models/subCategory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./category');
const {createSlug} = require("../utils/hook");


const SubCategory = sequelize.define('SubCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  catId: { 
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id'
    }
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
    beforeCreate: async (params) => {
      params.slug = createSlug(params.name);    
    },
    beforeUpdate: async (params) => {
      if (params.name) {
        params.slug = createSlug(params.name);    
      }
    }
  }
});


SubCategory.belongsTo(Category);
Category.hasMany(SubCategory);

module.exports = SubCategory;