// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const {ADDRESS_TYPE} = require("../../constant/types")
const Account = require("./account");

const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Account,
          key: 'id',
        },
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [Object.values(ADDRESS_TYPE)]
        },
    },   
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
}, {
    timestamps : true,
    tableName: 'addresses',
    paranoid: true,
    indexes: [
        { fields: ['accountId', 'type'] },
        { fields: ['accountId', 'isDefault'] }
    ]
});
  

Address.belongsTo(Account, { foreignKey: 'accountId', as : 'addresses', onDelete: 'CASCADE' });
Account.hasMany(Address, { foreignKey: 'accountId' });

module.exports = Address;
  