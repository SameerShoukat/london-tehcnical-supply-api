const express = require('express');
const router = express.Router()
const swaggerJsdoc = require("swagger-jsdoc"),
      swaggerUi = require("swagger-ui-express")


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LONDON TECHNICAL SUPPLY',
      version: '1.0.0',
      description: 'API Documentation for London Technical Supply Marketplace',
      contact: {
        name: "API Support",
        url: "http://69.62.123.50:5000",
        email: "your@email.com"
      }
    },
    // servers: [
    //   {
    //     url: "http://69.62.123.50:5000",
    //     description: "Production server"
    //   },
    //   {
    //     url: "http://localhost:5000",
    //     description: "Local development server"
    //   }
    // ],
    components: {
      securitySchemes: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter the token with the Bearer: prefix, e.g. "Bearer abcde12345"',
        },
      }
    },
  },
  apis: ['./routes/users.js', './routes/catalog.js', './routes/category.js', './routes/subCategory.js', './routes/website.js', './routes/attributes.js', './routes/product.js', './routes/productTag.js', './routes/gallery.js', './routes/vendor.js', './routes/purchase.js', './routes/constant.js', './routes/order.js','./routes/order.js','./routes/productQuote.js', './routes/productReviews.js', './routes/couponCodes.js', './routes/shipmentCharges.js', './routes/brand.js', './routes/vehicleType.js']
}


const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    validatorUrl: null,
    persistAuthorization: true,
    defaultModelsExpandDepth: -1
  }
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, swaggerOptions));

module.exports = router;
