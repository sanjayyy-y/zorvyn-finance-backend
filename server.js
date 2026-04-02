require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

connectDB();

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
  });
}

module.exports = app;

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
