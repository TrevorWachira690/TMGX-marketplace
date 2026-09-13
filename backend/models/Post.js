const mongoose = require('mongoose');

// Structure follows the curriculum's Week 11 Post model pattern
// (text index, a like() instance method, a findByAuthor static) —
// domain fields reflect the marketplace concept: a "post" here is a
// business listing (product/service with a price and category), not
// a generic blog post.
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be 0 or greater'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    image: { type: String, default: '' }, // legacy single image
    images: { type: [String], default: [] },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    dislikedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for search across title, description, and category.
postSchema.index({ title: 'text', description: 'text', category: 'text' });

// Instance method: toggle a like from a given user. Liking removes
// any existing dislike from the same user (mutually exclusive), and
// vice versa in toggleDislike below.
postSchema.methods.toggleLike = function (userId) {
  const idStr = userId.toString();
  const alreadyLiked = this.likedBy.some((id) => id.toString() === idStr);

  if (alreadyLiked) {
    this.likedBy = this.likedBy.filter((id) => id.toString() !== idStr);
  } else {
    this.likedBy.push(userId);
    this.dislikedBy = this.dislikedBy.filter((id) => id.toString() !== idStr);
  }
  this.likes = this.likedBy.length;
  this.dislikes = this.dislikedBy.length;
  return this.save();
};

// Instance method: toggle a dislike, mutually exclusive with a like.
postSchema.methods.toggleDislike = function (userId) {
  const idStr = userId.toString();
  const alreadyDisliked = this.dislikedBy.some((id) => id.toString() === idStr);

  if (alreadyDisliked) {
    this.dislikedBy = this.dislikedBy.filter((id) => id.toString() !== idStr);
  } else {
    this.dislikedBy.push(userId);
    this.likedBy = this.likedBy.filter((id) => id.toString() !== idStr);
  }
  this.likes = this.likedBy.length;
  this.dislikes = this.dislikedBy.length;
  return this.save();
};

// Static method: find all listings by a given business (author _id).
postSchema.statics.findByAuthor = function (authorId) {
  return this.find({ author: authorId });
};

module.exports = mongoose.model('Post', postSchema);
