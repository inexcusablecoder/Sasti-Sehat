const mongoose = require('mongoose');

// Disable long buffering timeouts if MongoDB service is not reachable
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sasti_sehat', {
      serverSelectionTimeoutMS: 2000 // Fast timeout if local MongoDB daemon is offline
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Database service offline (${error.message}). Running with fallback memory datasets.`);
  }
};

module.exports = connectDB;
