const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('../models/users');

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User, // Reference the User table
        key: 'id',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    tableName: 'refresh_tokens',
    timestamps: false,
  });

User.hasMany(RefreshToken, { foreignKey: 'userId', as : 'user', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = RefreshToken