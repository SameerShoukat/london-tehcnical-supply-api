// models/role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  deleteAt : {
    type : DataTypes.DATE,
    allowNull : true
  },
  accounts: {
    type: DataTypes.ARRAY(DataTypes.ENUM('read', 'manage', 'delete')),
    allowNull: false,
    defaultValue: ['read']
  },
  stocks: {
    type: DataTypes.ARRAY(DataTypes.ENUM('read', 'manage', 'delete')),
    allowNull: false,
    defaultValue: ['read']
  },
  orders: {
    type: DataTypes.ARRAY(DataTypes.ENUM('read', 'manage', 'delete')),
    allowNull: false,
    defaultValue: ['read']
  },
  finance: {
    type: DataTypes.ARRAY(DataTypes.ENUM('read', 'manage', 'delete')),
    allowNull: false,
    defaultValue: ['read']
  }
}, {
  hooks: {
    beforeCreate: async (role) => {
      role.slug = createSlug(role.name);    
    }
  }
});

module.exports = Role;