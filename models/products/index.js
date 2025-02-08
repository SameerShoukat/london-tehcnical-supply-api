const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { createSlug } = require("../utils/hook");
const Category = require('./category');
const SubCategory = require('./subCategory');
const User = require('./user');
const Catalog = require('./catalog');
const Website = require('./website');

const MAX_STOCK = 999999;

const PRODUCT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft',
    DISCONTINUED: 'discontinued'
};
  
const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    itemId: {
      type: DataTypes.STRING,
      unique: true
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255]
      }
    },
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      validate: {
        maxLength(value) {
          if (value && value.length > 5) {
            throw new Error('Maximum of 5 images allowed');
          }
        },
        isValidUrls(value) {
          if (value) {
            const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i;
            const invalidUrls = value.filter(url => !urlRegex.test(url));
            if (invalidUrls.length > 0) {
              throw new Error('Invalid image URLs detected');
            }
          }
        }
      },
      comment: 'Array of product image URLs'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(PRODUCT_STATUS)]
      },
      defaultValue: PRODUCT_STATUS.DRAFT
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    totalStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: MAX_STOCK
        },
        comment: 'Total available stock quantity'
    },
    inStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: MAX_STOCK,
        stockCheck(value) {
          if (value > this.totalStock) {
            throw new Error('In stock cannot exceed total stock');
          }
        }
      },
      comment: 'Current stock available for sale'
    },
    // Foreign Keys
    catalogId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'catalogs',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    subCategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sub_categories',
        key: 'id'
      }
    },
    websiteId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'websites',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'products',
    paranoid: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ['slug'] },
      { unique: true, fields: ['sku'] },
      { fields: ['itemId'] },
      { fields: ['status'] },
      { fields: ['catalogId'] },
      { fields: ['categoryId'] },
      { fields: ['subCategoryId'] },
      { fields: ['websiteId'] }
    ],
    hooks: {
      beforeCreate: (product) => {
        product.slug = createSlug(product.name);
      },
      beforeUpdate: (product) => {
        if (product.changed('name')) {
          product.slug = createSlug(product.name);
        }
        if (product.changed()) {
          product.version += 1;
        }
      }
    }
});

// Define associations
Product.belongsTo(Catalog, {foreignKey: 'catalogId', as: 'catalog'});
Catalog.hasMany(Product, {foreignKey: 'catalogId'});

Product.belongsTo(Category, {foreignKey: 'catId', as: 'category'});
Category.hasMany(Product, {foreignKey: 'catId'});

Product.belongsTo(SubCategory, {foreignKey: 'subCatId', as: 'subCategory'});
SubCategory.hasMany(Product, {foreignKey: 'subCatId'});

Product.belongsTo(Website, {foreignKey: 'websiteId', as: 'website'});
Website.hasMany(Product, {foreignKey: 'websiteId'});

Product.belongsTo(User, {foreignKey: 'userId', as: 'user'});
User.hasMany(Product, {foreignKey: 'userId'});

module.exports = Product

  