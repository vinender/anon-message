const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getAnonymousMessages,
  getMessages,
  getSentMessages, // Ensure this function exists
} = require('../controllers/messageController');

const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/messages
// @desc    Send a message
router.post('/', sendMessage);

router.get('/anonymous', protect, getAnonymousMessages);

// @route   GET /api/messages
// @desc    Get messages for authenticated user
router.get('/', protect, getMessages);

// @route   GET /api/messages/sent
// @desc    Get messages sent by the authenticated user
router.get('/sent', protect, getSentMessages);

module.exports = router;
