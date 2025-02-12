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
        model: User,
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

// Changed the alias to 'refreshTokens' for the hasMany relationship
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
// Added an alias 'user' only for the belongsTo relationship
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = RefreshToken;