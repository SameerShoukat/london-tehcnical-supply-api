const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../users");
const { Product } = require("./index");
const Vendor = require("../vendor");
const _ = require("lodash");
const boom = require("@hapi/boom");

const PURCHASE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const SUPPORTED_CURRENCIES = ["USD", "AED", "GBP"];

const Purchase = sequelize.define(
  "Purchase",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      defaultValue: () => "LTS-" + Math.floor(1000 + Math.random() * 9000)
    },
    currency: {
      type: DataTypes.STRING,
      validate: {
        isIn: [SUPPORTED_CURRENCIES],
      },
    },
    subTotal: {
      type: DataTypes.DECIMAL(12, 2),
      validate: {
        min: 0,
      },
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    tax: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    shipping: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
        isValidTotal(value) {
          const calculated = parseFloat(
            (this.subTotal - this.discount + this.tax + this.shipping).toFixed(
              2
            )
          );
          if (parseFloat(value) !== calculated) {
            throw boom.badImplementation(
              "Total amount must equal subTotal - discount + tax + shipping"
            );
          }
        },
      },
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: PURCHASE_STATUS.PENDING,
      validate: {
        isIn: [Object.values(PURCHASE_STATUS)],
      },
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Vendor,
        key: "id",
      },
    },
    items: {
      type: DataTypes.JSON,
      validate: {
        notEmpty: true,
        isValidItems(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Purchase must have at least one item");
          }
          for (const { productId, quantity, costPrice } of value) {
            if (!productId || quantity < 1 || costPrice < 0) {
              throw new Error(
                "Each item needs productId, quantity ≥1, costPrice ≥0"
              );
            }
          }
        },
      },
    },
    paymentType: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["cash", "card", "bank_transfer", "cheque"]],
      },
    },
    paymentInformation: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.STRING,
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "purchases",
    timestamps: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["vendorId"] },
      { fields: ["userId"] },
    ],
    hooks: {
      beforeValidate: (purchase) => {
         // 1) generate invoiceNumber first
        if (!purchase.invoiceNumber) {
          purchase.invoiceNumber = "LTS-" + Math.floor(1000 + Math.random() * 9000);
        }

        let sub = 0;
        for (const { quantity, costPrice } of purchase.items) {
          sub += quantity * costPrice;
        }
        purchase.subTotal = sub;
        purchase.totalAmount = parseFloat(
          (
            sub -
            ++purchase.discount +
            +purchase.tax +
            +purchase.shipping
          ).toFixed(2)
        );
      },
      beforeSave: async (purchase) => {
        const enriched = [];
        for (item of purchase.items) {
          const product = await Product.findByPk(item.productId);
          if (!product)
            throw boom.notFound(`Product ${item.productId} not found`);

          enriched.push({
            ...item,
            total: +item.costPrice * +item.quantity,
            name: product.name,
            sku: product.sku,
          });
        }
        purchase.setDataValue("items", enriched);
      },
      afterCreate: async (purchase) => {
        if (purchase.status !== PURCHASE_STATUS.COMPLETED) return;
        for (const item of purchase.items) {
          await updateProductStock(
            item.productId,
            item.quantity,
            null,
            null,
            "add"
          );
        }
      },
      afterUpdate: async (purchase) => {
        const prev = purchase.previous("items");
        const prevStatus = purchase.previous("status");
        const newStatus = purchase.status;

        const oldMap = new Map(prev.map((i) => [i.productId, i]));
        const newMap = new Map(purchase.items.map((i) => [i.productId, i]));

        for (const [pid, oldItem] of oldMap) {
          if (!newMap.has(pid) && prevStatus === PURCHASE_STATUS.COMPLETED) {
            await updateProductStock(
              pid,
              oldItem.quantity,
              prevStatus,
              "destroy"
            );
          }
        }

        for (const [pid, newItem] of newMap) {
          if (!oldMap.has(pid) && newStatus === PURCHASE_STATUS.COMPLETED) {
            await updateProductStock(pid, newItem.quantity, prevStatus, "add");
          }
        }

        for (const [pid, newItem] of newMap) {
          if (oldMap.has(pid)) {
            const oldItem = oldMap.get(pid);
            // quantity changed
            if (
              newItem.quantity !== oldItem.quantity ||
              newStatus !== prevStatus
            ) {
              await updateProductStock(
                pid,
                newItem.quantity,
                prevStatus,
                "update",
                oldItem.quantity
              );
            }
          }
        }
      },
      afterDestroy: async (purchase) => {
        if (purchase.status === PURCHASE_STATUS.COMPLETED) {
          for (const item of purchase.items) {
            await updateProductStock(
              item.productId,
              item.quantity,
              null,
              "destroy"
            );
          }
        }
      },
    },
  }
);
async function updateProductStock(
  productId,
  quantity,
  previousStatus,
  action,
  previousQuantity = 0
) {
  const product = await Product.findByPk(productId);
  if (!product) throw boom.notFound("Product not found");

  let delta = 0;
  if (action === "add") {
    delta = quantity;
  } else if (action === "destroy") {
    delta = -quantity;
  } else if (action === "update") {
    if (
      previousStatus !== PURCHASE_STATUS.COMPLETED &&
      action === "update" &&
      product.status === PURCHASE_STATUS.COMPLETED
    ) {
      delta = quantity;
    } else if (
      previousStatus === PURCHASE_STATUS.COMPLETED &&
      product.status !== PURCHASE_STATUS.COMPLETED
    ) {
      delta = -previousQuantity;
    } else {
      delta = quantity - previousQuantity;
    }
  }

  const newStock = product.inStock + delta;
  if (newStock < 0) throw boom.badImplementation("Stock cannot be negative");

  await product.update({ inStock: newStock, version: product.version + 1 });
}

Purchase.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Purchase, { foreignKey: "userId" });

Purchase.belongsTo(Vendor, { foreignKey: "vendorId", as: "vendor" });
Vendor.hasMany(Purchase, { foreignKey: "vendorId" });

module.exports = { Purchase, PURCHASE_STATUS };
