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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running successfully.' });
});

app.use('/api', routes);

// 404 handler for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
