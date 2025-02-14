const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./permission');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['user', 'admin']],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'This email is already in use. Please choose a different one.',
    },
    validate: {
      isEmail: true,
    },
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Permission,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  paranoid: true,
  timestamps: true,
  hooks: {
    afterDestroy: async (user, options) => {
      if (user.permissionId) {
        await Permission.destroy({ where: { id: user.permissionId } });
      }
    },
  },
});

User.belongsTo(Permission, { foreignKey: 'permissionId', as: 'permission' });
Permission.hasOne(User, { foreignKey: 'permissionId', onDelete: 'CASCADE' });

module.exports = User;
