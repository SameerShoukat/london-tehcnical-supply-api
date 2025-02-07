// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const validateEnv = require('./middleware/validateEnv');
const { sequelize, models } = require('./models');
const apiDocumentation =  require("./swagger")
const {errorMiddleware} = require("./middleware/decorateError")
const path = require("path")

// Load environment variables
dotenv.config();
validateEnv(); // Validate environment variables

const app = express();

// Middleware
app.use(cors({
  origin: '*' // Your React app's URL
}));
app.use(helmet());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/documentation', apiDocumentation);
app.use('/api/user', require('./routes/users'));
app.use('/api/role', require('./routes/roles'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/category', require('./routes/category'));
app.use('/api/subCategory', require('./routes/subCategory'));
app.use('/api/website', require('./routes/website'));

// Error handling middleware
app.use(errorMiddleware);

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));




// Database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');


    // Sync models
    
    // await sequelize.sync({
    //   alter: true
    // })
    // console.log('Models synchronized successfully');

    // Start the server
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('SIGINT received. Closing database connection...');
      await sequelize.close(); // Close Sequelize connection
      server.close(() => {
        console.log('Server closed. Exiting process.');
        process.exit(0);
      });
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Closing database connection...');
      await sequelize.close(); // Close Sequelize connection
      server.close(() => {
        console.log('Server closed. Exiting process.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit if connection fails
  }
})();
