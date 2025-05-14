const express = require('express');
const {
  sendMessage,
  getMessages,
  getMessage,
  deleteMessage
} = require('../controllers/messageController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

router.route('/:id')
  .get(getMessage)
  .delete(deleteMessage);

module.exports = router;