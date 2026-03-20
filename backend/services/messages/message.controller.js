const Conversation = require('../../models/Conversation');
const Notification = require('../../models/Notification');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;

    // FIX: invalid ObjectId would crash with CastError
    if (!isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // FIX: GET should only fetch, never create. Removed auto-creation on GET.
    // Creating a conversation is the job of sendMessage (POST).
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, otherUserId] }
    });

    if (!conversation) {
      return res.json({ participants: [req.user.id, otherUserId], messages: [] });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { text } = req.body;

    // FIX: validate ObjectId format
    if (!isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // FIX: reject empty or missing text
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    // FIX: prevent messaging yourself
    if (otherUserId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send a message to yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, otherUserId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, otherUserId],
        messages: []
      });
    }

    conversation.messages.push({
      senderId: req.user.id,
      text: text.trim(),
      timestamp: Date.now()
    });
    conversation.lastUpdated = Date.now();
    await conversation.save();

    await Notification.create({
      userId: otherUserId,
      type: 'new_message',
      fromUser: req.user.id,
      message: 'Sent you a new message'
    });

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getConversationsList = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      // FIX: also populate 'role' so the frontend can show the correct label (Student/Alumni)
      .populate('participants', 'name designation role')
      .sort({ lastUpdated: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
