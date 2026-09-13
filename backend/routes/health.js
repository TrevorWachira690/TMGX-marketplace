const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/health - used by deployment platforms and uptime monitors
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStates[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
