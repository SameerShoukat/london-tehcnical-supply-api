// models/website.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Website = sequelize.define('Website', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    unique : true
  },
  url: {
    type: DataTypes.STRING,
    unique : true
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue : true
  }
});

module.exports = Website // models/website.js