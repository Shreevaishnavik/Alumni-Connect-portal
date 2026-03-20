const express = require('express');
const router = express.Router();

const userRoutes = require('../services/users/user.routes');
const jobRoutes = require('../services/jobs/job.routes');
const messageRoutes = require('../services/messages/message.routes');
const notifyRoutes = require('../services/notify/notify.routes');

router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/messages', messageRoutes);
router.use('/notify', notifyRoutes);

module.exports = router;
