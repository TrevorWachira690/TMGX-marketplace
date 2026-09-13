const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// requireAuth ("protect" in the curriculum): requires a valid
// "Authorization: Bearer <token>" header, loads the full user from
// the database, and attaches it as req.user so controllers can read
// req.user._id, req.user.role, etc.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(err);
  }
}

// optionalAuth: attaches req.user if a valid token is present, but
// never blocks the request if it's missing or invalid. Useful for
// routes that behave differently for logged-in vs anonymous users
// without requiring login.
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id);
    }

    next();
  } catch (err) {
    // Invalid/expired token on an optional route: continue as anonymous.
    next();
  }
}

// restrictTo(...adminRoles): use after requireAuth to gate a route to
// specific site-admin permission levels, e.g. restrictTo('admin').
// Checks req.user.adminRole, not the marketplace business/customer role.
function restrictTo(...adminRoles) {
  return (req, res, next) => {
    if (!req.user || !adminRoles.includes(req.user.adminRole)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, restrictTo };
