const Notification = require('../../models/Notification');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate('fromUser', 'name')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    // FIX: invalid ObjectId format causes CastError 500 — return 404 instead
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
