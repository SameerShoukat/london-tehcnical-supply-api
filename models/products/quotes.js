const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { Product } = require("./index");

const QUOTE_STATUS = {
  PENDING: "pending",
  CONTACTED: "contacted",
  COMPLETED: "completed",
  REJECTED: "rejected",
};

const ProductQuote = sequelize.define(
  "ProductQuote",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(QUOTE_STATUS)],
      },
      defaultValue: QUOTE_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
    tableName: "product_quotes",
    indexes: [
      { fields: ["productId"] },
      { fields: ["email"] },
      { fields: ["status"] },
    ],
    hooks: {
      beforeUpdate: async (instance, options) => {
        if (instance.changed("website")) {
          throw new Error("Website field is immutable and cannot be updated.");
        }
      },
    },
  }
);

ProductQuote.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  onDelete: "SET NULL",
});
Product.hasMany(ProductQuote, { foreignKey: "productId" });

module.exports = ProductQuote;
