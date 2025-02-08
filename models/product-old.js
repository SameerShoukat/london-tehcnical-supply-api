// product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    { fields: ['brand'] },
    { fields: ['status'] }
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

// product_attributes.js
const ProductAttribute = sequelize.define('ProductAttribute', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'product_attributes',
  indexes: [
    { fields: ['productId'] },
    { fields: ['name'] }
  ]
});

// product_pricing.js
const ProductPricing = sequelize.define('ProductPricing', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  basePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: true
  },
  discountValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  finalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  effectiveFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  effectiveTo: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'product_pricing',
  indexes: [
    { fields: ['productId', 'currency', 'effectiveFrom'] },
    { fields: ['currency'] }
  ]
});

// Define relationships
Product.hasMany(ProductAttribute, { as: 'attributes' });
ProductAttribute.belongsTo(Product);

Product.hasMany(ProductPricing, { as: 'pricing' });
ProductPricing.belongsTo(Product);




module.exports = {
  Product,
  ProductAttribute,
  ProductPricing,
  PRODUCT_STATUS
};