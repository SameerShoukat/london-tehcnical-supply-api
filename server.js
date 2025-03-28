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
  origin: '*',
  methods: 'GET,PUT,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  exposedHeaders: 'Content-Range,X-Content-Range'
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "cdn.jsdelivr.net",
        "unpkg.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "cdn.jsdelivr.net",
        "unpkg.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "validator.swagger.io",
        "online.swagger.io"
      ]
    }
  },
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('trust proxy', true);

// Routes
// Serve Swagger assets
const swaggerUiAssetPath = path.dirname(require.resolve('swagger-ui-dist/package.json'));
app.use('/documentation/swagger-ui.css', (req, res) => {
  res.sendFile(path.join(swaggerUiAssetPath, 'swagger-ui.css'));
});
app.use('/documentation/static', express.static(swaggerUiAssetPath));

app.use('/documentation', (req, res, next) => {
  res.set('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use('/documentation', apiDocumentation);

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
app.use('/api/constant', require('./routes/constant'));
app.use('/api/order', require('./routes/order'));
app.use('/api/quotes', require('./routes/productQuote'));
app.use('/api/reviews', require('./routes/productReviews'));


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
