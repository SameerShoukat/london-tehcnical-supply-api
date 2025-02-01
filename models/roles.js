const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { createSlug } = require('../utils/hook');


const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'This name is already in use. Please choose a different one.'
      },
      validate: {
        notEmpty: {
          msg: 'The name cannot be empty.'
        },
        len: {
          args: [3, 50],
          msg: 'The name be between 3 and 50 characters long.'
        }
      }
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
    }
  },
  {
    tableName : 'roles',
    paranoid: true, // Enables soft deletes
    timestamps: true, // Enables createdAt and updatedAt
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
  }
);

module.exports = Role;
