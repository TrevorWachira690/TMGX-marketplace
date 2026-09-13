// Catches any error thrown or passed to next(err) in the app and
// returns a consistent, user-friendly JSON response.
function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);

  // Payload too large (e.g. base64 image exceeds body limit)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Image is too large. Please use a smaller photo (under ~5MB).' });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || { field: 1 })[0];
    return res.status(409).json({ error: `That ${field} is already in use.` });
  }

  // Invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong on our end.' : err.message;
  res.status(status).json({ error: message });
}

// 404 handler for unmatched routes
function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
