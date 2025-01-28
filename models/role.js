// models/role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const {createSlug} = require("../utils/hook")

const Role = sequelize.define('Role', {
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
  type : {
    type : DataTypes.ENUM('admin', 'user'),
    defaultValue : 'user',
  },
  accounts: {
    type: DataTypes.ARRAY(DataTypes.ENUM('read', 'manage', 'delete')),
    allowNull: true,
    defaultValue: ['read']
  },
  stocks: {
    type: DataTypes.ARRAY(DataTypes.ENUM('read', 'manage', 'delete')),
    allowNull: true,
    defaultValue: ['read']
  },
  orders: {
    type: DataTypes.ARRAY(DataTypes.ENUM('read', 'manage', 'delete')),
    allowNull: true,
    defaultValue: ['read']
  },
  finance: {
    type: DataTypes.ARRAY(DataTypes.ENUM('read', 'manage', 'delete')),
    allowNull: true,
    defaultValue: ['read']
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


module.exports = Role;