// models/subCategory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./category');
const { createSlug } = require('../utils/hook');
const User = require('./users');

const SubCategory = sequelize.define('SubCategory', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  catId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Category,
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
    unique: {
      args: true,
      msg : 'This name is already in use. Please choose a different one.'
    }
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    validate: {
      maxLength(value) {
        if (value && value.length > 5) {
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
    defaultValue: true
  }
}, {
  tableName: 'subCategories',
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
});

SubCategory.belongsTo(Category, { foreignKey: 'catId', as: 'category' });
Category.hasMany(SubCategory, { foreignKey: 'catId',as:'sub_categories', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

SubCategory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SubCategory, { foreignKey: 'userId' });

module.exports = SubCategory;
