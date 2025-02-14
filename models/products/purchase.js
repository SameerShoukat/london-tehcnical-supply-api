const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users');
const {Product} = require('./index');
const Vendor = require("../vendor");

const PURCHASE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const SUPPORTED_CURRENCIES = ['USD', 'AED', 'GBP'];

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.UUID, 
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [SUPPORTED_CURRENCIES]
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { 
          min: 1,
          max: 999999 // Added max validation
        }
    },
    costPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0
        }
    },
    totalAmount: {
        type: DataTypes.DECIMAL(12, 2),  // Changed to 12,2 for consistency
        allowNull: false,
        validate: {
          min: 0,
          isValidTotal(value) {
            const calculated = parseFloat((this.quantity * this.costPrice).toFixed(2));
            if (parseFloat(value) !== calculated) {
              throw new Error('Total amount must equal quantity * costPrice');
            }
          }
        }
    },
    status: {
        type: DataTypes.ENUM(Object.values(PURCHASE_STATUS)),
        defaultValue: PURCHASE_STATUS.PENDING,
        validate: {
          isIn: [Object.values(PURCHASE_STATUS)]
        }
    },
    vendorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Vendor,
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Product,
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
    tableName: 'purchases', 
    timestamps: true,
    indexes: [ 
      { fields: ['status'] },
      { fields: ['vendorId'] },
      { fields: ['productId'] },
      { fields: ['userId'] }
    ],
    hooks: {
        beforeValidate: (purchase) => {
          // Calculate total amount before validation
          if (purchase.quantity && purchase.costPrice) {
            purchase.totalAmount = parseFloat((purchase.quantity * purchase.costPrice).toFixed(2));
          }
        },
        beforeCreate: async (purchase) => {
          // Validate product exists
          const product = await Product.findByPk(purchase.productId);
          if (!product) throw new Error('Product not found');
        },
        afterCreate: async (purchase) => {
          await updateProductStock(purchase, 'add');
        },
        afterUpdate: async (purchase) => {
          if (purchase.changed('status')) {
            const previousStatus = purchase.previous('status');
            if (previousStatus === PURCHASE_STATUS.COMPLETED && 
                purchase.status !== PURCHASE_STATUS.COMPLETED) {
              await updateProductStock(purchase, 'subtract');
            } else if (purchase.status === PURCHASE_STATUS.COMPLETED && 
                      previousStatus !== PURCHASE_STATUS.COMPLETED) {
              await updateProductStock(purchase, 'add');
            }
          }
        },
        beforeDestroy: async (purchase) => {
          if (purchase.status === PURCHASE_STATUS.COMPLETED) {
            await updateProductStock(purchase, 'subtract');
          }
        }
    }
});
// Example payload

// Improved helper function with error handling
const updateProductStock = async (purchase, action) => {
    if (purchase.status !== PURCHASE_STATUS.COMPLETED) return;

    try {
        const product = await Product.findByPk(purchase.productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const change = action === 'add' ? purchase.quantity : -purchase.quantity;
        const newStock = product.totalStock + change;

        if (newStock < 0) {
            throw new Error('Stock cannot be negative');
        }

        await product.update({ 
            totalStock: newStock,
            version: product.version + 1
        });
    } catch (error) {
        console.error('Error updating product stock:', error);
        throw error;
    }
};

// Define associations
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Purchase, { foreignKey: 'userId'});

Purchase.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Purchase, { foreignKey: 'productId'});

Purchase.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });
Vendor.hasMany(Purchase, { foreignKey: 'vendorId'}); 

module.exports = { Purchase, PURCHASE_STATUS };