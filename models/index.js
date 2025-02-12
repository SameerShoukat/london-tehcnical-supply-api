const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const basename = path.basename(__filename);

const models = {};

// Function to recursively read models from directories
const loadModels = (directory) => {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      // Recursively load models from subdirectories
      loadModels(fullPath);
    } else if (file !== basename && file.endsWith('.js')) {
      const model = require(fullPath);
      models[model.name] = model;
    }
  });
};

// Load all models from the models directory and its subdirectories
loadModels(__dirname);

// Attach each model to Sequelize
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Export Sequelize instance and models
module.exports = { sequelize, models };
