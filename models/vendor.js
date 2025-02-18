const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const User = require('./users')

const Vendor = sequelize.define('Vendor', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[0-9\-+\s]+$/ 
        }
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    streetAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    zipCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
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
    tableName: 'vendor',
    timestamps: true,
    paranoid: true,
    indexes: [
        { fields: ['country'] },
        { fields: ['zipCode'] },
        { fields: ['email'], unique: true },
        { fields: ['phone'] }
    ]
});

Vendor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Vendor, { foreignKey: 'userId' });


module.exports = Vendor;