const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

function generateToken(userId) {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    businessName: user.businessName,
    businessType: user.businessType,
    category: user.category,
    location: user.location,
    whatsappNumber: user.whatsappNumber,
    avatar: user.avatar,
    bio: user.bio,
  };
}

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      role,
      businessName,
      businessType,
      category,
      location,
      whatsappNumber,
    } = req.body;

    if (role && !['business', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "business" or "customer"' });
    }

    if (role === 'business' && !businessName) {
      return res.status(400).json({ error: 'Business accounts must provide a business name' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or username already exists',
      });
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'customer',
      ...(role === 'business' && {
        businessName,
        businessType: businessType || '',
        category: category || '',
        location: location || '',
        whatsappNumber: whatsappNumber || '',
      }),
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me (protected)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
