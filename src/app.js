const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const globalErrorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const routes = require('./routes/index');

const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Vercel serverless functions sometimes fail to serve Swagger's local static assets
// So we force Swagger to load its CSS and JS from a public CDN
const swaggerUiOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.min.js',
  ],
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running successfully.' });
});

// redirect root to api docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.use('/api', routes);

// 404 handler for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
