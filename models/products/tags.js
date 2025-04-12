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
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    paranoid: true,
    timestamps: true,
    tableName: "product_tags",
    indexes: [{ unique: true, fields: ["slug"] }],
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
