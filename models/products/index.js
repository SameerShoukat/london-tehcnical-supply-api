const { DataTypes, Op } = require('sequelize');
const sequelize = require('../../config/database');
const { createSlug } = require('../../utils/hook');
const Category = require('../category');
const SubCategory = require('../subCategory');
const User = require('../users');
const Catalog = require('../catalog');
const Website = require('../website');
const ProductCodes = require('./codes');
const Brand = require('./brand');
const VehicleType = require('./vehicleType');

const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued',
  DRAFT: 'draft',
  PUBLISH: 'publish'
};

const TAGS = {
  ON_SALE: 'on_sale',
  BEST_SELLING: 'best_selling',
  NEW_ARRIVAL: 'new_arrival',
  FEATURE: 'feature'
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
    unique: false
  },
  productCode: {
    type: DataTypes.UUID,
    references: { model: ProductCodes, key: 'id' }
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
    unique: false
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
    validate: { min: 0 },
    comment: 'Stock available for sale'
  },
  saleStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 },
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Array of tags'
  },
  vehicleTypeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: VehicleType, key: 'id' }
  },
  brandId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: Brand, key: 'id' }
  },
  // Foreign Keys
  catalogId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: Catalog, key: 'id' }
  },
  catId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: Category, key: 'id' }
  },
  subCategoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: SubCategory, key: 'id' }
  },
  websiteId: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true, 
    defaultValue: [], 
    comment: 'Array of website IDs where product is published'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' }
  }
}, {
  tableName: 'products',
  paranoid: true,
  timestamps: true,
  indexes: [
    { fields: ['slug']},
    { fields: ['sku'] },
    { fields: ['status'] },
    { fields: ['catalogId'] },
    { fields: ['catId'] },
    { fields: ['subCategoryId'] },
    { fields: ['vehicleTypeId'] },
    { fields: ['brandId'] }
  ],
  hooks: {
    beforeCreate: async(product) => {
      if (product.name) {
        product.slug = createSlug(product.name);
      }
      if (product.vehicleTypeId) {
        await VehicleType.increment('productCount', { where: { id: product.vehicleTypeId } });
      }
      if (product.brandId) {
        await Brand.increment('productCount', { where: { id: product.brandId } });
      }
    },
    afterCreate: async (product) => {
      try {
        if (product?.catalogId) {
          console.log("Create catalog triggered")
          await Catalog.increment('productCount', { by: 1, where: { id: product.catalogId } });
        }
        if (product?.catId) {
          console.log("Create category triggered")
          await Category.increment('productCount', { by: 1, where: { id: product.catId } });
        }
        if (product?.subCategoryId) {
          console.log("Create sub category triggered")
          await SubCategory.increment('productCount', { by: 1, where: { id: product.subCategoryId } });
        }
        if (product?.websiteId?.length > 0) {
          console.log("Create websiteId triggered")
          await Website.increment('productCount', {
            by: 1,
            where: { id: { [Op.in]: product.websiteId } }
          });
        }
      } catch (error) {
        console.error('Error in afterCreate hook:', error);
        throw error;
      }
    },
    beforeUpdate: async (product) => {
      if (product.changed('name')) {
        product.slug = createSlug(product.name);
      }
      if (product.changed()) {
        product.version += 1;
      }
      if (product.changed('vehicleTypeId')) {
        const oldVehicleTypeId = product.previous('vehicleTypeId');
        if (oldVehicleTypeId) {
          await VehicleType.decrement('productCount', { where: { id: oldVehicleTypeId } });
        }
        if (product.vehicleTypeId) {
          await VehicleType.increment('productCount', { where: { id: product.vehicleTypeId } });
        }
      }
      if (product.changed('brandId')) {
        const oldBrandId = product.previous('brandId');
        if (oldBrandId) {
          await Brand.decrement('productCount', { where: { id: oldBrandId } });
        }
        if (product.brandId) {
          await Brand.increment('productCount', { where: { id: product.brandId } });
        }
      }
    },
    afterUpdate: async (product) => {
      try {
        if (product.changed('catalogId')) {
          const oldCatalogId = product.previous('catalogId');
          const newCatalogId = product.catalogId;
          if (oldCatalogId) await Catalog.decrement('productCount', { by: 1, where: { id: oldCatalogId } });
          if (newCatalogId) await Catalog.increment('productCount', { by: 1, where: { id: newCatalogId } });
        }
        if (product.changed('catId')) {
          const oldCatId = product.previous('catId');
          const newCatId = product.catId;
          if (oldCatId) await Category.decrement('productCount', { by: 1, where: { id: oldCatId } });
          if (newCatId) await Category.increment('productCount', { by: 1, where: { id: newCatId } });
        }
        if (product.changed('subCategoryId')) {
          console.log("update subCategoryId trigger")
          const oldSubCatId = product.previous('subCategoryId');
          const newSubCatId = product.subCategoryId;
          if (oldSubCatId) await SubCategory.decrement('productCount', { by: 1, where: { id: oldSubCatId } });
          if (newSubCatId) await SubCategory.increment('productCount', { by: 1, where: { id: newSubCatId } });
        }
        if (product.changed('websiteId')) {
          console.log("update websiteId trigger")
          const oldWebsiteIds = product.previous('websiteId') || [];
          const newWebsiteIds = product.websiteId || [];
          const websitesToRemove = oldWebsiteIds.filter(id => !newWebsiteIds.includes(id));
          const websitesToAdd = newWebsiteIds.filter(id => !oldWebsiteIds.includes(id));

          if (websitesToRemove.length > 0) {
            await Website.decrement('productCount', { by: 1, where: { id: { [Op.in]: websitesToRemove } } });
          }
          if (websitesToAdd.length > 0) {
            await Website.increment('productCount', { by: 1, where: { id: { [Op.in]: websitesToAdd } } });
          }
        }
      } catch (error) {
        console.error('Error in afterUpdate hook:', error);
        throw error;
      }
    },
    beforeDestroy: async (product) => {
      try {
        const updates = [];
        if (product.catalogId) {
          updates.push(Catalog.decrement('productCount', { by: 1, where: { id: product.catalogId } }));
        }
        if (product.catId) {
          updates.push(Category.decrement('productCount', { by: 1, where: { id: product.catId } }));
        }
        if (product.subCategoryId) {
          updates.push(SubCategory.decrement('productCount', { by: 1, where: { id: product.subCategoryId } }));
        }
        if (product.websiteId?.length > 0) {
          updates.push(Website.decrement('productCount', { by: 1, where: { id: { [Op.in]: product.websiteId } } }));
        }
        if (product.vehicleTypeId) {
          await VehicleType.decrement('productCount', { where: { id: product.vehicleTypeId } });
        }
        if (product.brandId) {
          await Brand.decrement('productCount', { where: { id: product.brandId } });
        }
        await Promise.all(updates);
      } catch (error) {
        console.error('Error in beforeDestroy hook:', error);
        throw error;
      }
    }
  }
});

Product.belongsTo(Catalog, { foreignKey: 'catalogId', as: 'catalog', onDelete: 'SET NULL' });
Catalog.hasMany(Product, { foreignKey: 'catalogId', onDelete: 'SET NULL' });

Product.belongsTo(Category, { foreignKey: 'catId', as: 'category', onDelete: 'SET NULL' });
Category.hasMany(Product, { foreignKey: 'catId', onDelete: 'SET NULL' });

Product.belongsTo(SubCategory, { foreignKey: 'subCategoryId', as: 'subCategory', onDelete: 'SET NULL' });
SubCategory.hasMany(Product, { foreignKey: 'subCategoryId', onDelete: 'SET NULL' });

Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand', onDelete: 'SET NULL' });
Brand.hasMany(Product, { foreignKey: 'brandId', onDelete: 'SET NULL' });

Product.belongsTo(VehicleType, { foreignKey: 'vehicleTypeId', as: 'vehicleType', onDelete: 'SET NULL' });
VehicleType.hasMany(Product, { foreignKey: 'vehicleTypeId', onDelete: 'SET NULL' });

Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Product, { foreignKey: 'userId' });

module.exports = { Product, PRODUCT_STATUS, TAGS };