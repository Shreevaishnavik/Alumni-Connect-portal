const Job = require('../../models/Job');
const Notification = require('../../models/Notification');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const VALID_STATUSES = ['applied', 'under_review', 'accepted', 'rejected'];

exports.createJob = async (req, res) => {
  try {
    const job = new Job({ ...req.body, postedBy: req.user.id });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { type, skills, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    if (type) query.type = type;
    // FIX: trim whitespace when splitting skills e.g. "React, Node" → ["React", "Node"]
    if (skills) query.requiredSkills = { $in: skills.split(',').map(s => s.trim()) };

    // FIX: parseInt so arithmetic isn't done on strings
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const jobs = await Job.find(query)
      .populate('postedBy', 'name designation company')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJobById = async (req, res) => {
  try {
    // FIX: invalid ObjectId crashes with CastError — return 404 instead
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name designation company')
      .populate('applicants.userId', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    // FIX: validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // FIX: prevent the job poster (alumni) from applying to their own posting
    if (job.postedBy.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot apply to your own job posting' });
    }

    // FIX: only allow applying to active jobs
    if (!job.isActive) {
      return res.status(400).json({ message: 'This job posting is no longer active' });
    }

    const alreadyApplied = job.applicants.some(a => a.userId.toString() === req.user.id);
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

    job.applicants.push({ userId: req.user.id, status: 'applied' });
    await job.save();

    await Notification.create({
      userId: job.postedBy,
      type: 'job_application',
      fromUser: req.user.id,
      message: `Someone applied for your posting: ${job.title}`
    });

    res.json({ message: 'Successfully applied' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id, userId } = req.params;

    // FIX: validate that status is a permitted enum value
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    // FIX: validate ObjectId formats
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return res.status(404).json({ message: 'Job or applicant not found' });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const applicant = job.applicants.find(a => a.userId.toString() === userId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.status = status;
    await job.save();

    await Notification.create({
      userId,
      type: 'application_status',
      fromUser: req.user.id,
      message: `Your application status for ${job.title} was updated to ${status}`
    });

    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('applicants.userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applicants.userId': req.user.id })
      .populate('postedBy', 'name company');

    const applications = jobs.map(job => {
      const applicant = job.applicants.find(a => a.userId.toString() === req.user.id);
      return {
        job: { _id: job._id, title: job.title, company: job.company, type: job.type },
        appliedAt: applicant.appliedAt,
        status: applicant.status
      };
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    // FIX: validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.isActive = false;
    await job.save();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
