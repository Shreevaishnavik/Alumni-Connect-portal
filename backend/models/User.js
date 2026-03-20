const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  batch: { type: Number, index: true },
  department: String,
  company: String,
  designation: String,
  bio: String,
  skills: { type: [String], index: true },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connectionRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
  }],
  createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ name: 'text', company: 'text' });

module.exports = mongoose.model('User', UserSchema);
