// models/OrderItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Order = require("./order");

const OrderItem = sequelize.define('OrderItem', {
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    productSnapshot: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
  }, {
    tableName: 'order_items',
    indexes: [
        { fields: ['orderId'] },
        { fields: ['productId'] }
    ]
});

OrderItem.belongsTo(Order, {foreignKey : 'orderId', as: 'items', onDelete : 'CASCADE'})
Order.hasMany(OrderItem, {foreignKey : 'orderId'})

module.exports = OrderItem


