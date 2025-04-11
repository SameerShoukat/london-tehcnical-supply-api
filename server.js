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
  origin: '*', // Allow all origins
  methods: 'GET,PUT,POST,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization',
  exposedHeaders: 'Content-Range,X-Content-Range'
}));

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP temporarily for testing
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('trust proxy', true);


// Explicitly set headers to allow insecure connections
app.use('/documentation', (req, res, next) => {
  res.set({
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline'", // Relax CSP temporarily
  });
  next();
}, apiDocumentation);


app.use('/api/user', require('./routes/users'));
app.use('/api/role', require('./routes/roles'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/category', require('./routes/category'));
app.use('/api/subCategory', require('./routes/subCategory'));
app.use('/api/website', require('./routes/website'));
app.use('/api/attribute', require('./routes/attributes'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/purchase', require('./routes/purchase'));
app.use('/api/product', require('./routes/product'));
app.use('/api/productTags', require('./routes/productTag'));
app.use('/api/constant', require('./routes/constant'));
app.use('/api/order', require('./routes/order'));
app.use('/api/quotes', require('./routes/productQuote'));
app.use('/api/reviews', require('./routes/productReviews'));
app.use('/api/gallery', require('./routes/gallery'));


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
