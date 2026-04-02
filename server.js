require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Catch uncaught exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
});

// Catch unhandled rejections (e.g. unhandled promise rejections)
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  // Give server time to finish pending requests before exiting
  server.close(() => {
    process.exit(1);
  });
});
