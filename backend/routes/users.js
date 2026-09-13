const express = require('express');
const usersController = require('../controllers/usersController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Specific/static paths must come before the /:id wildcard route,
// or Express will match "export"/"import" as if they were a user ID.
router.get('/export', requireAuth, usersController.exportData);
router.post('/import', requireAuth, usersController.importData);
router.put('/me', requireAuth, usersController.updateMe);

router.get('/:id', usersController.getUserById);
router.get('/:id/posts', optionalAuth, usersController.getUserPosts);

module.exports = router;
