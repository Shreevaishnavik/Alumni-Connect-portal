const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  type: { type: String, enum: ['job', 'internship', 'mentorship'], required: true },
  description: { type: String, required: true },
  requiredSkills: { type: [String], index: true },
  deadline: Date,
  applicants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['applied', 'under_review', 'accepted', 'rejected'], default: 'applied' },
    appliedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
