const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./users");

const Website = sequelize.define(
  "Website",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 10000],
      },
    },
    productCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: "websites",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
    ],
  }
);

// Define associations
Website.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Website, { foreignKey: "userId" });

module.exports = Website;
