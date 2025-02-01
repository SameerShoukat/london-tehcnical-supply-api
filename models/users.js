const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./roles');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4, // This is correct
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'This email is already in use. Please choose a different one.'
    },
    validate: {
      isEmail: true
    }
  },
  roleId: {  // This is your foreign key
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Role,
      key: 'id'
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
    tableName : 'users',
    paranoid: true, // Enables soft deletes
    timestamps: true, // Enables createdAt and updatedAt
});


User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId' });  // `roleId` links Role to Users
module.exports = User;
