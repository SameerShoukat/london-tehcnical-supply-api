const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const Website = sequelize.define('Website', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  url: {
    type: DataTypes.STRING,
    unique: {
      args: true,
      msg: 'This URL is already in use. Please choose a different one.'
    },
    allowNull: false,
    validate: {
      isUrl: true,
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 10000]
    }
  },
  productCount: {
    type: DataTypes.INTEGER,
    defaultValue : 0
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Reference the table name, not the model
      key: 'id'
    }
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'websites',
  paranoid: true,
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    }
  ]
});

// Define associations
Website.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Website, { foreignKey: 'userId' });

module.exports = Website;