// models/catalog.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { createSlug } = require("../utils/hook");

const TYPE = {
  BANNER: "banner",
  BRAN: "brand",
};

const Gallery = sequelize.define(
  "Gallery",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(TYPE)],
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "gallery",
    timestamps: true,
    hooks: {
      beforeCreate(instance) {
        instance.slug = createSlug(instance.name);
      },
      beforeUpdate(instance) {
        if (instance.name) {
          instance.slug = createSlug(instance.name);
        }
      },
    },
  }
);

module.exports = {Gallery, TYPE};
