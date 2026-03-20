const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validate } = require('../../middleware/validator');
const authMiddleware = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');
const jobController = require('./job.controller');

const createJobSchema = Joi.object({
  title: Joi.string().required(),
  company: Joi.string().required(),
  type: Joi.string().valid('job', 'internship', 'mentorship').required(),
  description: Joi.string().required(),
  requiredSkills: Joi.array().items(Joi.string()),
  deadline: Joi.date()
});

router.use(authMiddleware);

router.post('/', roleCheck('alumni'), validate(createJobSchema), jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/my/listings', roleCheck('alumni'), jobController.getMyListings);
router.get('/my/applications', roleCheck('student'), jobController.getMyApplications);
router.get('/:id', jobController.getJobById);
router.post('/:id/apply', roleCheck('student'), jobController.applyForJob);
router.put('/:id/applicant/:userId/status', roleCheck('alumni'), jobController.updateApplicantStatus);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
