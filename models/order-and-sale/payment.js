
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const {PAYMENT_STATUS, CURRENCY} = require("../../constant/types")
const Order = require("./order");
const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
      model: Order,
      key: 'id'
      }
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(PAYMENT_STATUS)],
      },
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [CURRENCY],
      },
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gatewayResponse: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    refundedAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
  }, {
    tableName: 'payments',
    paranoid: true,
    indexes: [
        { fields: ['orderId'] },
        { fields: ['transactionId'] },
        { fields: ['status'] }
    ]
});

Payment.belongsTo(Order, { 
  foreignKey: 'orderId', 
  as: 'order', 
  onDelete: 'CASCADE'
});

Order.hasMany(Payment, { 
  foreignKey: 'orderId',
  as: 'payments'
});


module.exports = Payment
