const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🏥 Sasti-Sehat Backend Server running on port ${PORT}`);
  console.log(`  🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  💾 Database Engine: MongoDB`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Unhandled Promise Rejection]: ${err.message}`);
});

module.exports = server;
