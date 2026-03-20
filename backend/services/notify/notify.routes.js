const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const notifyController = require('./notify.controller');

router.use(authMiddleware);

router.get('/', notifyController.getNotifications);
router.get('/unread-count', notifyController.getUnreadCount);
router.put('/read-all', notifyController.markAllRead);
router.put('/:id/read', notifyController.markRead);

module.exports = router;
