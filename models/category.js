// Description: This file contains the schema and model for the category.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const {createSlug} = require("../utils/hook");
const Catalog = require('./catalog');
const User = require('./users');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  catalogId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Catalog, 
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 10000]
    }
  },
  productCount: {
    type: DataTypes.INTEGER,
    defaultValue : 0
  },
  slug: {
    type: DataTypes.STRING,
    unique :false
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
  }
},
{
  tableName : 'categories',
  paranoid: true,
  timestamps: true,
  hooks: {
    beforeCreate: async (instance) => {
      instance.slug = createSlug(instance.name);
      const existing = await Category.findOne({
        where: { 
          slug: instance.slug,
          catalogId: instance.catalogId 
        }
      });
      if (existing) {
        throw new Error('A category with this name already exists in this catalog');
      }
    },
    beforeUpdate: async (instance) => {
      if (instance.name) {
        instance.slug = createSlug(instance.name);
        const existing = await Category.findOne({
          where: { 
            slug: instance.slug,
            catalogId: instance.catalogId,
            id: { [sequelize.Op.ne]: instance.id }
          }
        });
        if (existing) {
          throw new Error('A category with this name already exists in this catalog');
        }
      }
    },
  },
}
);

Category.belongsTo(Catalog, {foreignKey: 'catalogId', as: 'catalog'});
Catalog.hasMany(Category, {foreignKey: 'catalogId', as: 'sub_categories', onDelete: 'CASCADE', onUpdate: 'CASCADE'});


Category.belongsTo(User, { foreignKey: 'userId', as: 'user'});
User.hasMany(Category, { foreignKey: 'userId' });

module.exports = Category;