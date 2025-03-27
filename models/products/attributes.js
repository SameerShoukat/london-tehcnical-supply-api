
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users');
const { createSlug } = require("../../utils/hook");

const Attribute = sequelize.define('Attribute', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isValidName(value) {
        if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
          throw new Error('Name can only contain letters, numbers, and spaces');
        }
        if (value.trim().length === 0) {
          throw new Error('Name cannot be just spaces');
        }
      }
    }
  },
  slug: {
    type: DataTypes.STRING,
    unique: {
      args: true,
      msg: 'This name is already in use. Please choose a different one'
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
  tableName: 'attributes',
  indexes: [
    { fields: ['name'] }
  ],
  hooks: {
    beforeCreate(instance) {
      instance.slug = createSlug(instance.name);
    },
    beforeUpdate(instance) {
      if (instance.name) {
        instance.slug = createSlug(instance.name);
      }
    },
  },
});



Attribute.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Attribute, { foreignKey: 'userId'});

module.exports = Attribute;

