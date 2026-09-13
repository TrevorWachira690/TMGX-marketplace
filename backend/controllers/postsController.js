const Post = require('../models/Post');

// GET /api/posts
// Supports category filter, text search, sorting, and pagination.
const getAllPosts = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 10 } = req.query;

    let query = { published: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular') {
      sortOption = { likes: -1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find(query)
      .populate('author', 'username avatar businessName whatsappNumber')
      .select('-likedBy')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'username avatar businessName whatsappNumber'
    );

    if (!post) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(post);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }
    next(err);
  }
};

// POST /api/posts (protected, business accounts only)
// Author is taken from the authenticated user, never from the request body.
const createPost = async (req, res, next) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business accounts can create listings' });
    }

    const { title, description, price, category, image, images } = req.body;
    const imageArray = images || (image ? [image] : []);

    const post = new Post({
      title,
      description,
      price,
      category,
      image: image || imageArray[0] || '',
      images: imageArray,
      author: req.user._id,
    });

    await post.save();
    await post.populate('author', 'username avatar businessName whatsappNumber');

    res.status(201).json(post);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }
    next(err);
  }
};

// PUT /api/posts/:id (protected, author only)
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own listings' });
    }

    const { title, description, price, category, image, images, published } = req.body;
    if (title) post.title = title;
    if (description) post.description = description;
    if (price !== undefined) post.price = price;
    if (category) post.category = category;
    if (image !== undefined) post.image = image;
    if (images !== undefined) post.images = images;
    if (published !== undefined) post.published = published;

    await post.save();
    res.json(post);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }
    next(err);
  }
};

// DELETE /api/posts/:id (protected, author or site admin)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.adminRole === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own listings' });
    }

    await post.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// PATCH /api/posts/:id/like (protected) - toggles like on/off for the current user
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await post.toggleLike(req.user._id);
    res.json({
      post: { _id: post._id, likes: post.likes, dislikes: post.dislikes, likedBy: post.likedBy, dislikedBy: post.dislikedBy },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/posts/:id/dislike (protected) - toggles dislike on/off for the current user
const dislikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await post.toggleDislike(req.user._id);
    res.json({
      post: { _id: post._id, likes: post.likes, dislikes: post.dislikes, likedBy: post.likedBy, dislikedBy: post.dislikedBy },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  dislikePost,
};
