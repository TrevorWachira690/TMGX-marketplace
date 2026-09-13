const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Structure follows the curriculum's Week 11 User model pattern
// (bcrypt hashing via a pre('save') hook, comparePassword instance
// method, select:false on password) — but the domain fields reflect
// this project's actual concept: a marketplace where users are either
// a business (selling listings) or a customer (browsing them).
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    // Marketplace role - not the curriculum's user/admin permission
    // role. See adminRole below for actual site-admin permissions.
    role: {
      type: String,
      enum: ['business', 'customer'],
      default: 'customer',
    },
    // Separate from marketplace role: whether this account has site
    // admin permissions (moderation, force-delete, etc.), matching
    // the curriculum's restrictTo('admin') pattern.
    adminRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    businessName: { type: String, trim: true, default: '' },
    businessType: { type: String, default: '' },
    category: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    whatsappNumber: { type: String, trim: true, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 280, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
