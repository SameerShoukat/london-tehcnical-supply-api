
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users');

const ProductCodes = sequelize.define('ProductCodes', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  paranoid: true,
  timestamps: true,
  tableName: 'product_codes',
  indexes: [
    { fields: ['code'] }
  ]
});


ProductCodes.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ProductCodes, { foreignKey: 'userId'});

module.exports = ProductCodes;

