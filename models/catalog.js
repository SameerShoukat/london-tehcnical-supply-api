// models/catalog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const {createSlug} = require("../utils/hook");

const Catalog = sequelize.define('Catalog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    unique: true,
    allowNull: true,
    validate: {
      maxLength(value) {
        if (value.length > 5) {
          throw new Error('The image array cannot contain more than 5 images.');
        }
      }
    }
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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

module.exports = Catalog;