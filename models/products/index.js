const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { createSlug } = require("../../utils/hook");
const Category = require('../category');
const SubCategory = require('../subCategory');
const User = require('../users');
const Catalog = require('../catalog');
const Website = require('../website');

const MAX_STOCK = 999999;

const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  DISCONTINUED: 'discontinued',
  PUBLISH : 'publish'
};

const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
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
    inStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
      comment: 'Stock available for sale'
    },
    saleStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    // Foreign Keys
    catalogId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Catalog,
        key: 'id'
      }
    },
    catId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Category,
        key: 'id'
      }
    },
    subCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: SubCategory,
        key: 'id'
      }
    },
    websiteId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Website,
        key: 'id'
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
    tableName: 'products',
    paranoid: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ['slug'] },
      { unique: true, fields: ['sku'] },
      { fields: ['status'] },
      { fields: ['catalogId'] },
      { fields: ['catId'] },
      { fields: ['subCategoryId'] },
      { fields: ['websiteId'] }
    ],
    hooks: {
      beforeCreate: (product) => {
        if (product.name) {
              product.slug = createSlug(product.name);
        }
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
Product.belongsTo(Catalog, {foreignKey: 'catalogId', as: 'catalog', onDelete: 'SET NULL'});
Catalog.hasMany(Product, {foreignKey: 'catalogId', onDelete: 'SET NULL'});

Product.belongsTo(Category, {foreignKey: 'catId', as: 'category', onDelete: 'SET NULL'});
Category.hasMany(Product, {foreignKey: 'catId', onDelete: 'SET NULL'});

Product.belongsTo(SubCategory, {foreignKey: 'subCatId', as: 'subCategory', onDelete: 'SET NULL'});
SubCategory.hasMany(Product, {foreignKey: 'subCatId', onDelete: 'SET NULL'});

Product.belongsTo(Website, {foreignKey: 'websiteId', as: 'website',  onDelete: 'SET NULL'});
Website.hasMany(Product, {foreignKey: 'websiteId', onDelete: 'SET NULL'});

Product.belongsTo(User, {foreignKey: 'userId', as: 'user'});
User.hasMany(Product, {foreignKey: 'userId'});

module.exports = {Product, PRODUCT_STATUS}

  