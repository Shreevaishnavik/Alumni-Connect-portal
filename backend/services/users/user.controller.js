const User = require('../../models/User');
const Notification = require('../../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Helper: check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, batch, department } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, role, batch, department });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userRes = user.toObject();
    delete userRes.password;

    res.status(201).json({ token, user: userRes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userRes = user.toObject();
    delete userRes.password;

    res.json({ token, user: userRes });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDirectory = async (req, res) => {
  try {
    const { search, batch, department, skills, page = 1, limit = 10 } = req.query;
    let query = { role: 'alumni' };

    if (search) query.$text = { $search: search };
    if (batch) query.batch = Number(batch);
    if (department) query.department = department;
    if (skills) query.skills = { $in: skills.split(',').map(s => s.trim()) };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // FIX: invalid ObjectId format would crash with CastError — return 404 instead
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name designation company');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // FIX: whitelist allowed fields — prevent role/email/password escalation via body
    const { name, company, designation, bio, skills, batch, department } = req.body;
    const allowed = { name, company, designation, bio, skills, batch, department };

    // Remove undefined keys so they don't overwrite existing values with undefined
    Object.keys(allowed).forEach(key => allowed[key] === undefined && delete allowed[key]);

    const user = await User.findByIdAndUpdate(req.user.id, allowed, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendConnectionRequest = async (req, res) => {
  try {
    const targetId = req.params.targetId;

    // FIX: validate ObjectId format
    if (!isValidObjectId(targetId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (targetId === req.user.id) return res.status(400).json({ message: 'Cannot connect with yourself' });

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const alreadyConnected = targetUser.connections.some(c => c.toString() === req.user.id);
    if (alreadyConnected) return res.status(400).json({ message: 'Already connected' });

    const requestExists = targetUser.connectionRequests.some(cr => cr.from.toString() === req.user.id && cr.status === 'pending');
    if (requestExists) return res.status(400).json({ message: 'Request already pending' });

    targetUser.connectionRequests.push({ from: req.user.id, status: 'pending' });
    await targetUser.save();

    await Notification.create({
      userId: targetId,
      type: 'connection_request',
      fromUser: req.user.id,
      message: 'Sent you a connection request'
    });

    res.json({ message: 'Connection request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.acceptConnection = async (req, res) => {
  try {
    const { requesterId } = req.params;

    // FIX: validate ObjectId format
    if (!isValidObjectId(requesterId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.user.id);
    const requester = await User.findById(requesterId);
    if (!requester) return res.status(404).json({ message: 'Requester not found' });

    const request = user.connectionRequests.find(r => r.from.toString() === requesterId && r.status === 'pending');
    if (!request) return res.status(404).json({ message: 'Pending request not found' });

    request.status = 'accepted';
    user.connections.push(requesterId);
    if (!requester.connections.some(c => c.toString() === user._id.toString())) {
      requester.connections.push(user._id);
      await requester.save();
    }
    await user.save();

    await Notification.create({
      userId: requesterId,
      type: 'connection_accepted',
      fromUser: user._id,
      message: 'Accepted your connection request'
    });

    res.json({ message: 'Connection accepted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.declineConnection = async (req, res) => {
  try {
    const { requesterId } = req.params;

    // FIX: validate ObjectId format
    if (!isValidObjectId(requesterId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.user.id);

    const request = user.connectionRequests.find(r => r.from.toString() === requesterId && r.status === 'pending');
    if (!request) return res.status(404).json({ message: 'Pending request not found' });

    request.status = 'declined';
    await user.save();

    res.json({ message: 'Connection declined' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({ path: 'connectionRequests.from', select: 'name designation' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsersAdmin = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const users = await User.find()
      .select('name email role batch createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserRoleAdmin = async (req, res) => {
  try {
    const { role } = req.body;

    // FIX: validate that provided role is an allowed enum value
    const validRoles = ['student', 'alumni', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
    }

    // FIX: validate ObjectId format before DB hit
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUserAdmin = async (req, res) => {
  try {
    // FIX: validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    // FIX: check if user actually existed before returning success
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
