// models/Account.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Order = require("./order")

const OrderHistory = sequelize.define('OrderHistory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Order,
          key: 'id'
        }
      },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    performerInfo : {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    performedBy: {
        type: DataTypes.UUID,
        allowNull: false
    },
}, {
    tableName: 'order_history',
    timestamps: true,
    indexes: [
        { fields: ['orderId'] },
        { fields: ['performedBy'] }
    ]
});

Order.hasMany(OrderHistory, { foreignKey: 'orderId', as :'orderHistory', onDelete : 'CASCADE' });
OrderHistory.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = OrderHistory;