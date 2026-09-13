const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// GET /api/users/:id/posts — a business's listings.
// Public visitors (and other logged-in users) only see published
// listings. The owner viewing their own listings also sees drafts.
const getUserPosts = async (req, res, next) => {
  try {
    const isOwner = req.user && req.user._id.toString() === req.params.id;
    const filter = { author: req.params.id };
    if (!isOwner) filter.published = true;

    const posts = await Post.find(filter)
      .populate('author', 'username avatar businessName')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    next(err);
  }
};

// GET /api/users/:id — public profile
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      businessName: user.businessName,
      businessType: user.businessType,
      category: user.category,
      location: user.location,
      whatsappNumber: user.whatsappNumber,
      avatar: user.avatar,
      bio: user.bio,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    next(err);
  }
};

// PUT /api/users/me (protected)
const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { username, bio, avatar, businessName, businessType, category, location, whatsappNumber } =
      req.body;

    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    // Business-only fields - no-op for customer accounts
    if (user.role === 'business') {
      if (businessName !== undefined) user.businessName = businessName;
      if (businessType !== undefined) user.businessType = businessType;
      if (category !== undefined) user.category = category;
      if (location !== undefined) user.location = location;
      if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;
    }

    await user.save();

    res.json({
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
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }
    next(err);
  }
};

// GET /api/users/export (protected) - export the current user's own
// listings and comments as JSON.
const exportData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    const comments = await Comment.find({ author: req.user._id }).sort({ createdAt: -1 });

    res.setHeader('Content-Disposition', 'attachment; filename="listings-export.json"');
    res.json({ exportedAt: new Date().toISOString(), user, posts, comments });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/import (protected) - import previously exported
// listings/comments. Ownership is always reassigned to the current
// user - an imported file can never set its own author.
const importData = async (req, res, next) => {
  try {
    const { posts, comments } = req.body;

    if (!Array.isArray(posts) || !Array.isArray(comments)) {
      return res.status(400).json({ error: 'Expected { posts, comments } arrays in the import payload.' });
    }

    const importedPosts = [];
    for (const p of posts) {
      if (!p.title || !p.description || p.price === undefined || !p.category) continue;
      const created = await Post.create({
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image || '',
        images: p.images || [],
        author: req.user._id,
        published: p.published !== undefined ? p.published : true,
      });
      importedPosts.push(created);
    }

    const importedComments = [];
    for (const c of comments) {
      if (!c.content || !c.post) continue;
      const post = await Post.findById(c.post);
      if (!post) continue;
      const created = await Comment.create({
        content: c.content,
        post: c.post,
        author: req.user._id,
      });
      importedComments.push(created);
    }

    res.status(201).json({
      message: `Imported ${importedPosts.length} listing(s) and ${importedComments.length} comment(s).`,
      posts: importedPosts,
      comments: importedComments,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserPosts, getUserById, updateMe, exportData, importData };
