const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { createSlug } = require("../utils/hook");
const Category = require('./category');
const SubCategory = require('./subCategory');
const User = require('./user');
const Catalog = require('./catalog');
const Website = require('./website');

const MAX_STOCK = 999999;
const MAX_PRICE = 999999999.99;

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: 'Unique identifier for the product'
  },
  itemId: {
    type: DataTypes.STRING,
    unique: true,
    comment: 'Unique item identifier from external system'
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'Stock keeping unit - unique product identifier'
  },
  catalogId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Catalog, 
      key: 'id'
    },
    comment: 'Reference to associated catalog'
  },
  catId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Category, 
      key: 'id'
    },
    comment: 'Reference to associated category'
  },
  subCatId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: SubCategory, 
      key: 'id'
    },
    comment: 'Reference to associated subcategory'
  },
  websiteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Website, 
      key: 'id'
    },
    comment: 'Reference to associated website'
  },
  manufacturerName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the product manufacturer'
  },
  manufacturerNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Manufacturer part number'
  },
  manufacturerWarranty: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Warranty information from manufacturer',
    validate: {
      isValidWarranty(value) {
        if (value && (!value.duration || !value.unit || !value.type)) {
          throw new Error('Warranty must include duration, unit, and type');
        }
      }
    }
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Product brand name'
  },
  madeIn: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Country of origin'
  },
  costPrice: {
    type: DataTypes.DECIMAL(12, 2),
    validate: {
      min: 0,
      max: MAX_PRICE
    },
    comment: 'Cost price in base currency'
  },
  baseCurrency: {
    type: DataTypes.ENUM('USD', 'GBP', 'AED'),
    defaultValue: 'USD',
    allowNull: false,
    comment: 'Base currency for the product'
  },
  priceInUSD: {
    type: DataTypes.DECIMAL(12, 2),
    validate: {
      min: 0,
      max: MAX_PRICE
    },
    comment: 'Selling price in US Dollars'
  },
  priceInGBP: {
    type: DataTypes.DECIMAL(12, 2),
    validate: {
      min: 0,
      max: MAX_PRICE
    },
    comment: 'Selling price in British Pounds'
  },
  priceInAED: {
    type: DataTypes.DECIMAL(12, 2),
    validate: {
      min: 0,
      max: MAX_PRICE
    },
    comment: 'Selling price in UAE Dirhams'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    },
    comment: 'Product display name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed product description'
  },
  specifications: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Technical specifications and features'
  },
  dimensions: {
    type: DataTypes.JSONB,
    allowNull: true,
    validate: {
      isValidDimensions(value) {
        if (value && (!value.length || !value.width || !value.height || !value.unit)) {
          throw new Error('Dimensions must include length, width, height, and unit');
        }
      }
    },
    comment: 'Product dimensions'
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    },
    comment: 'Product weight in kg'
  },
  slug: {
    type: DataTypes.STRING,
    unique: {
      args: true,
      msg: 'Product slug must be unique'
    },
    comment: 'URL-friendly product identifier'
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
  taxCategory: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tax/VAT category for the product'
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Tax/VAT rate as percentage'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional flexible attributes'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    comment: 'Product version number'
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
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['active', 'inactive', 'draft', 'discontinued']],
    },
    defaultValue: 'draft'
  }
}, {
  tableName: 'products',
  paranoid: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      unique: true,
      fields: ['sku']
    },
    {
      fields: ['itemId']
    },
    {
      fields: ['brand']
    },
    {
      fields: ['catalogId']
    },
    {
      fields: ['catId']
    },
    {
      fields: ['subCatId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['taxCategory']
    },
    {
      using: 'BTREE',
      fields: ['priceInUSD', 'priceInGBP', 'priceInAED']
    }
  ],
  hooks: {
    beforeValidate: (product) => {
      if (!product.sku && product.itemId) {
        product.sku = `SKU-${product.itemId}`;
      }
    },
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