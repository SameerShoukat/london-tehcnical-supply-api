const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { createSlug } = require("../../utils/hook");

const ProductTags = sequelize.define(
  "ProductTags",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    }
  },
  {
    timestamps: true,
    tableName: "product_tags",
    indexes: [
      { unique: true, fields: ["sku"] },
    ],
    hooks: {
      beforeCreate(instance) {
        instance.value = createSlug(instance.value);
      },
      beforeUpdate(instance) {
        if (instance.value) {
          instance.value = createSlug(instance.value);
        }
      },
    },
  }
);



module.exports = ProductTags;
