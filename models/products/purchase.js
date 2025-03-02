const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users');
const {Product} = require('./index');
const Vendor = require("../vendor");
const _ = require("lodash");
const boom = require("@hapi/boom");

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
              throw boom.badImplementation('Total amount must equal quantity * costPrice');
            }
          }
        }
    },
    status: {
        type: DataTypes.STRING,
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
          if (purchase.quantity && purchase.costPrice) {
            purchase.totalAmount = parseFloat((purchase.quantity * purchase.costPrice).toFixed(2));
          }
        },
        beforeCreate: async (purchase) => {
          const product = await Product.findByPk(purchase.productId);
          if (!product) throw boom.badRequest('Product not found');
        },
        beforeUpdate: async (purchase) => {
          const product = await Product.findByPk(purchase.productId);
          if (!product) throw boom.badRequest('Product not found');
        },
        afterCreate: async (purchase) => {
          if (purchase.status !== PURCHASE_STATUS.COMPLETED) return;
          await updateProductStock(purchase, null, null, 'add');
        },
        afterUpdate: async (purchase) => {
          if (purchase.changed('status') || purchase.changed('quantity')) {
            const previousStatus = purchase.previous('status');
            const previousQuantity = purchase.previous('quantity');
            const previousProductId = purchase.previous('productId');

            if (purchase.changed('productId')) {
              // Subtract quantity from previous product if its status was completed
              if (previousStatus === PURCHASE_STATUS.COMPLETED) {
                const previousProduct = await Product.findByPk(previousProductId);
                if (previousProduct) {
                  let newStock = Number(previousProduct.inStock) - Number(previousQuantity);
                  if (newStock < 0) {
                    throw boom.badImplementation('Stock cannot be negative');
                  }
                  await previousProduct.update({ 
                    inStock: newStock,
                    version: previousProduct.version + 1
                  });
                }
              }
            }

            // Only update stock if there's an actual change that impacts inventory
            if (purchase.status === PURCHASE_STATUS.COMPLETED || 
                previousStatus === PURCHASE_STATUS.COMPLETED) {
              await updateProductStock(purchase, previousQuantity, previousStatus, 'update');
            }
          }
        },
        afterDestroy: async (purchase) => {
          if (purchase.status === PURCHASE_STATUS.COMPLETED) {
            await updateProductStock(purchase, null, null, 'destroy');
          }
        }
    }
});
// Example payload

// Improved helper function with error handling
const updateProductStock = async (purchase, previousQuantity, previousStatus, action) => {
  try {
      const product = await Product.findByPk(purchase.productId);
      if (!product){
        if(action === 'destroy') return true;
          throw boom.notFound("Product not found")
        }
      
      let newStock =  Number(product.inStock); // Start with current stock
      
      if (action === 'update') {
          // Case 1: From not-completed to completed (add new quantity)
          if (purchase.status === PURCHASE_STATUS.COMPLETED && 
              previousStatus !== PURCHASE_STATUS.COMPLETED) {
              newStock +=  Number(purchase.quantity);
          }
          // Case 2: From completed to not-completed (remove quantity)
          else if (previousStatus === PURCHASE_STATUS.COMPLETED && 
                  purchase.status !== PURCHASE_STATUS.COMPLETED) {
              newStock -= Number(previousQuantity);
          }
          // Case 3: Remained completed but quantity changed
          else if (purchase.status === PURCHASE_STATUS.COMPLETED && 
                  previousStatus === PURCHASE_STATUS.COMPLETED && 
                  previousQuantity !== purchase.quantity) {
              // Remove old quantity, add new quantity
              newStock = newStock - +previousQuantity + +purchase.quantity;
          }
      }
      else if (action === 'add') {
          newStock += Number(purchase.quantity);
      }
      else if (action === 'destroy') {
          newStock -= Number(purchase.quantity);
      }
      
      console.log('New stock:', newStock); // For debugging

      if (newStock < 0) {
          throw boom.badImplementation('Stock cannot be negative');
      }



      await product.update({ 
          inStock: newStock,
          version: product.version + 1
      });
  } catch (error) {
      console.error('Error updating product stock:', error);
      throw boom.badRequest(error.message);
  }
}
// Define associations
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Purchase, { foreignKey: 'userId'});

Purchase.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Purchase, { foreignKey: 'productId'});

Purchase.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });
Vendor.hasMany(Purchase, { foreignKey: 'vendorId'}); 

module.exports = { Purchase, PURCHASE_STATUS };