const express = require('express');
const postsController = require('../controllers/postsController');
const commentsController = require('../controllers/commentsController');
const { requireAuth, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);

// Protected routes
router.post('/', requireAuth, postsController.createPost);
router.put('/:id', requireAuth, postsController.updatePost);
router.delete('/:id', requireAuth, postsController.deletePost);
router.patch('/:id/like', requireAuth, postsController.likePost);
router.patch('/:id/dislike', requireAuth, postsController.dislikePost);

// Nested comment routes for a post
router.get('/:postId/comments', commentsController.getComments);
router.post('/:postId/comments', requireAuth, commentsController.createComment);
router.delete('/:postId/comments/:commentId', requireAuth, commentsController.deleteComment);

module.exports = router;
