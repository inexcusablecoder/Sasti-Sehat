const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import API Routes
const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const billRoutes = require('./routes/billRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Core Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Enable static files cross-origin access
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded bill files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check API
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Sasti-Sehat AI Healthcare Price Transparency API',
    timestamp: new Date().toISOString(),
    database: 'MongoDB'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/treatments', treatmentRoutes);
app.use('/api/v1/bills', billRoutes);
app.use('/api/v1/ai', aiRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found - ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
