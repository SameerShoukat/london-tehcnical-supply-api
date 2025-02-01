// models/catalog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const {createSlug} = require("../utils/hook");
const User = require('./users');

const Catalog = sequelize.define('Catalog', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: {
      args: true,
      msg: 'This name is already in use. Please choose a different one.'
    },
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    validate: {
      maxLength(value) {
        if (value.length > 5) {
          throw new Error('The image array cannot contain more than 5 images.');
        }
      }
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User, 
      key: 'id'
    }
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue : true
  },

},
{
  tableName : 'catalogs',
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

Catalog.belongsTo(User, { foreignKey: 'userId', as: 'users' });
User.hasMany(Catalog, { foreignKey: 'userId' });

module.exports = Catalog;