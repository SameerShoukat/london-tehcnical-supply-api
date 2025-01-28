// models/role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./category');


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
  },
  deleteAt : {
    type : DataTypes.DATE,
    allowNull : true
  },
}, {
  hooks: {
    beforeCreate: async (subCategory) => {
      subCategory.slug = createSlug(subCategory.name);    
    }
  }
});

module.exports = SubCategory;