const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const messageController = require('./message.controller');

router.use(authMiddleware);

router.get('/conversations/list', messageController.getConversationsList);
router.get('/:otherUserId', messageController.getConversation);
router.post('/:otherUserId', messageController.sendMessage);

module.exports = router;
