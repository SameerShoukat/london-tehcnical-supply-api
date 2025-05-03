const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { createSlug } = require("../../utils/hook");


const Brand = sequelize.define('Brand', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    productCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'brands',
    paranoid: true,
    timestamps: true,
    hooks: {
      beforeCreate: (brand) => {
        brand.slug = createSlug(brand.name);
      },
      beforeUpdate: (brand) => {
        if (brand.changed('name')) {
          brand.slug = createSlug(brand.name);
        }
      }
    }
});


module.exports = Brand;
  