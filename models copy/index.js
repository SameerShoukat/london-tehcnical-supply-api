const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const basename = path.basename(__filename);

const models = {};

// Dynamically import all models in the `models` folder
fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    models[model.name] = model;
  });

// Attach each model to Sequelize
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Export Sequelize instance and models
module.exports = { sequelize, models };
