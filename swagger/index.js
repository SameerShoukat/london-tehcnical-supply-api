const express = require('express');
const router = express.Router()
const swaggerJsdoc = require("swagger-jsdoc"),
      swaggerUi = require("swagger-ui-express"),
      fs = require("fs")
const customCss = fs.readFileSync((process.cwd()+"/swagger/style.css"), 'utf8');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LONDON TECHNICAL SUPPLY',
      description: 'API Document of london and technical market place',
      version: '1.0.0',
    },
    host: "http://localhost:5000",
    basePath: "/api",
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
  apis: ['./routes/users.js', './routes/roles.js',  './routes/catalog.js'],
}

const accountSpecs = swaggerJsdoc(options)

// account api docs
var accountSwaggerHtml = swaggerUi.generateHTML(accountSpecs, {
  explorer: true,
  customCssUrl: customCss
})
router.use('/', swaggerUi.serveFiles(accountSpecs, {
  explorer: true,
  customCssUrl: customCss
}))
router.get('/', (req, res) => { res.send(accountSwaggerHtml) });
// account api docs

module.exports = router;

