const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['connection_request', 'connection_accepted', 'new_message', 'job_application', 'application_status'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
