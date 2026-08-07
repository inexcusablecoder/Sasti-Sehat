const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes requiring authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sasti_sehat_super_secret_jwt_key_2026_safe');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided' });
  }
};

// Optional auth (attaches req.user if token valid, but allows guest access)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sasti_sehat_super_secret_jwt_key_2026_safe');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore token failure for optional auth
    }
  }
  next();
};

// Admin role check
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, optionalAuth, adminOnly };
